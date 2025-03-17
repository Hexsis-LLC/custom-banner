import {eq} from 'drizzle-orm';
import {db} from '../db.server';
import {
  announcements,
  announcementsXPagePatterns,
  announcementText,
  bannerBackground,
  bannerForm,
  callToAction,
  pagePatterns,
} from '../../drizzle/schema/announcement';
import type {
  CreateAnnouncementInput,

} from '../types/announcement';
import { CloudflareKVService } from "./cloudflareKV.server";
import { AnnouncementRepositoryService } from './announcement-repository.service';
import { AnnouncementTransformerService } from './announcement-transformer.service';
import { convertToKVData, createBackgroundValues, createFormValues, createTextValues, createCtaValues } from '../utils/announcement-utils';
import type { AugmentedDbAnnouncement } from './announcement-transformer.service';

// Database-specific text settings
export class AnnouncementService {
  private kvService: CloudflareKVService;
  private repository: AnnouncementRepositoryService;
  private transformer: AnnouncementTransformerService;

  constructor() {
    this.kvService = new CloudflareKVService();
    this.repository = new AnnouncementRepositoryService();
    this.transformer = new AnnouncementTransformerService();
  }

  private async updateKv(shopId: string) {
    const announcements = await this.getActiveAnnouncements(shopId);
    
    if (!announcements.length) {
      await this.kvService.updateAnnouncementsByShop(shopId, {
        global: [],
        __patterns: [],
      });
      return;
    }

    const groupedAnnouncements = await this.transformer.transformActiveAnnouncements(
      announcements as unknown as AugmentedDbAnnouncement[]
    );
    
    const kvData = convertToKVData(groupedAnnouncements);
    const result = await this.kvService.updateAnnouncementsByShop(shopId, kvData);

    if (!result) {
      throw new Error('Failed to update KV store');
    }
  }

  async getAnnouncement(id: number) {
    return this.repository.getAnnouncement(id);
  }

  async createAnnouncement(data: CreateAnnouncementInput) {
    const {
      texts,
      background,
      form,
      pagePatterns: patterns = ['__global'],
      ...announcementData
    } = data;

    // Create the announcement
    const [createdAnnouncement] = await db
      .insert(announcements)
      .values({
        ...announcementData,
        isActive: announcementData.isActive === true,
      })
      .returning();

    // Create related data in a transaction
    await this.createAnnouncementRelations(
      createdAnnouncement.id, 
      texts, 
      background, 
      form, 
      patterns
    );

    // Fetch the complete announcement
    const completeAnnouncement = await this.getAnnouncement(createdAnnouncement.id);
    
    if (!completeAnnouncement) {
      throw new Error('Failed to fetch complete announcement after creation');
    }

    // Update KV if published
    if (completeAnnouncement.status === 'published') {
      try {
        await this.updateKv(announcementData.shopId);
      } catch (error) {
        // Continue even if KV update fails
      }
    }

    return completeAnnouncement;
  }

  private async createAnnouncementRelations(
    announcementId: number,
    texts: CreateAnnouncementInput['texts'],
    background: CreateAnnouncementInput['background'],
    form: CreateAnnouncementInput['form'],
    patterns: string[]
  ) {
    return db.transaction(async (tx) => {
      // Create texts and CTAs
      for (const text of texts) {
        const { callToActions, ...textData } = text;
        const textValues = createTextValues(textData, announcementId);

        const [createdText] = await tx
          .insert(announcementText)
          .values(textValues)
          .returning();

        if (callToActions?.length) {
          for (const cta of callToActions) {
            const ctaValues = createCtaValues(cta, createdText.id);
            await tx.insert(callToAction).values(ctaValues);
          }
        }
      }

      // Create background if provided
      if (background) {
        const bgValues = createBackgroundValues(background, announcementId);
        await tx.insert(bannerBackground).values(bgValues);
      }

      // Create form if provided
      if (form) {
        const formValues = createFormValues(form, announcementId);
        await tx.insert(bannerForm).values(formValues);
      }

      // Create page patterns
      await this.createPagePatterns(tx, announcementId, patterns);
    });
  }

  private async createPagePatterns(tx: any, announcementId: number, patterns: string[]) {
    for (const pattern of patterns) {
      // Find existing pattern or create new one
      let pagePattern = await tx
        .select()
        .from(pagePatterns)
        .where(eq(pagePatterns.pattern, pattern))
        .then((rows: any[]) => rows[0]);

      if (!pagePattern) {
        [pagePattern] = await tx
          .insert(pagePatterns)
          .values({ pattern })
          .returning();
      }

      // Create the link
      await tx.insert(announcementsXPagePatterns).values({
        pagePatternsID: pagePattern.id,
        announcementsID: announcementId,
      });
    }
  }

  async getActiveAnnouncements(shopId: string, currentPath?: string) {
    return this.repository.getActiveAnnouncements(shopId, currentPath);
  }

  async updateAnnouncement(id: number, data: Partial<CreateAnnouncementInput>) {
    const {
      texts,
      background,
      form,
      pagePatterns: patterns,
      ...announcementData
    } = data;

    const result = await this.processAnnouncementUpdate(id, announcementData, texts, background, form, patterns);

    // Update KV if necessary
    const updatedAnnouncement = await this.getAnnouncement(id);
    if (updatedAnnouncement?.status === 'published') {
      try {
        await this.updateKv(updatedAnnouncement.shopId);
      } catch (error) {
        // Continue even if KV update fails
      }
    }

    return result;
  }

  private async processAnnouncementUpdate(
    id: number,
    announcementData: any,
    texts?: CreateAnnouncementInput['texts'],
    background?: CreateAnnouncementInput['background'],
    form?: CreateAnnouncementInput['form'],
    patterns?: string[]
  ) {
    return db.transaction(async (tx) => {
      // Update main announcement data
      if (Object.keys(announcementData).length > 0) {
        await tx
          .update(announcements)
          .set(announcementData)
          .where(eq(announcements.id, id));
      }

      // Update texts and CTAs if provided
      if (texts?.length) {
        await this.updateTextsAndCTAs(tx, id, texts);
      }

      // Update background if provided
      if (background) {
        await this.updateBackground(tx, id, background);
      }

      // Update form if provided
      if (form) {
        await this.updateForm(tx, id, form);
      }

      // Update page patterns if provided
      if (patterns) {
        await this.updatePagePatterns(tx, id, patterns);
      }

      return this.getAnnouncement(id);
    });
  }

  private async updateTextsAndCTAs(tx: any, id: number, texts: CreateAnnouncementInput['texts']) {
    // Delete existing texts and CTAs
    const existingTexts = await tx
      .select()
      .from(announcementText)
      .where(eq(announcementText.announcementId, id));

    for (const text of existingTexts) {
      await tx
        .delete(callToAction)
        .where(eq(callToAction.announcementTextId, text.id));
    }
    
    await tx
      .delete(announcementText)
      .where(eq(announcementText.announcementId, id));

    // Insert new texts and CTAs
    for (const text of texts) {
      const { callToActions, ...textData } = text;
      const textValues = createTextValues(textData, id);

      const [newText] = await tx
        .insert(announcementText)
        .values(textValues)
        .returning();

      if (callToActions?.length) {
        for (const cta of callToActions) {
          const ctaValues = createCtaValues(cta, newText.id);
          await tx.insert(callToAction).values(ctaValues);
        }
      }
    }
  }

  private async updateBackground(tx: any, id: number, background: CreateAnnouncementInput['background']) {
    await tx
      .delete(bannerBackground)
      .where(eq(bannerBackground.announcementId, id));

    const bgValues = createBackgroundValues(background, id);
    await tx.insert(bannerBackground).values(bgValues);
  }

  private async updateForm(tx: any, id: number, form: CreateAnnouncementInput['form']) {
    await tx.delete(bannerForm).where(eq(bannerForm.announcementId, id));
    const formValues = createFormValues(form, id);
    await tx.insert(bannerForm).values(formValues);
  }

  private async updatePagePatterns(tx: any, id: number, patterns: string[]) {
    // Delete existing patterns
    await tx
      .delete(announcementsXPagePatterns)
      .where(eq(announcementsXPagePatterns.announcementsID, id));

    // Insert new patterns
    await this.createPagePatterns(tx, id, patterns);
  }

  async deleteAnnouncement(id: number) {
    const announcement = await this.getAnnouncement(id);
    const shopId = announcement?.shopId;

    const result = await this.repository.bulkDeleteAnnouncements([id]);

    // Update KV if necessary
    if (shopId) {
      try {
        await this.updateKv(shopId);
      } catch (error) {
        // Continue even if KV update fails
      }
    }

    return result;
  }

  async toggleAnnouncementStatus(id: number, isActive: boolean) {
    return this.repository.toggleAnnouncementStatus(id, isActive);
  }

  async getAnnouncementsByShop(shopId: string) {
    return this.repository.getAnnouncementsByShop(shopId);
  }

  async getFilteredAnnouncementsByShop(
    shopId: string,
    tab: string,
    search: string,
    sort: string,
    page: number,
    limit: number
  ) {
    return this.repository.getFilteredAnnouncementsByShop(shopId, tab, search, sort, page, limit);
  }

  async bulkDeleteAnnouncements(ids: number[]) {
    // Get the announcements to get their shopIds
    const existingAnnouncements = await Promise.all(ids.map(id => this.getAnnouncement(id)));
    const shopIds = [...new Set(existingAnnouncements.filter(a => a !== null).map(a => a!.shopId))];

    const result = await this.repository.bulkDeleteAnnouncements(ids);

    // Update KV for all affected shops
    await Promise.all(shopIds.map(async shopId => {
      try {
        await this.updateKv(shopId);
      } catch (error) {
        // Continue even if KV update fails
      }
    }));

    return result;
  }

  async bulkUpdateAnnouncementStatus(ids: number[], status: 'draft' | 'published' | 'paused' | 'ended') {
    const result = await this.repository.bulkUpdateAnnouncementStatus(ids, status);

    // If status is published, update KV for all affected shops
    if (status === 'published') {
      const shopIds = [...new Set(result.map(a => a.shopId))];
      await Promise.all(shopIds.map(async shopId => {
        try {
          await this.updateKv(shopId);
        } catch (error) {
          // Continue even if KV update fails
        }
      }));
    }

    return result;
  }

  async bulkDuplicateAnnouncements(ids: number[]) {
    return await db.transaction(async (tx) => {
      const originals = await Promise.all(ids.map(id => this.getAnnouncement(id)));
      
      return await Promise.all(
        originals
          .filter((original): original is NonNullable<typeof original> => original !== null)
          .map(original => this.duplicateAnnouncement(tx, original))
      );
    });
  }

  private async duplicateAnnouncement(tx: any, original: any) {
    // Create the base announcement
    const announcementValues: Omit<typeof announcements.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
      type: original.type,
      title: `${original.title} (copy)`,
      shopId: original.shopId,
      size: original.size,
      heightPx: original.heightPx ?? undefined,
      widthPercent: original.widthPercent ?? undefined,
      startType: original.startType,
      endType: original.endType,
      startDate: original.startDate,
      endDate: original.endDate,
      showCloseButton: Boolean(original.showCloseButton),
      closeButtonPosition: original.closeButtonPosition,
      closeButtonColor: original.closeButtonColor,
      timezone: original.timezone ?? undefined,
      isActive: original.isActive ?? undefined,
      status: 'draft',
      displayBeforeDelay: original.displayBeforeDelay ?? undefined,
      showAfterClosing: original.showAfterClosing ?? undefined,
      showAfterCTA: original.showAfterCTA ?? undefined,
      childAnnouncementId: original.childAnnouncementId ?? undefined
    };

    const [newAnnouncement] = await tx
      .insert(announcements)
      .values(announcementValues)
      .returning();

    // Duplicate texts and CTAs
    await this.duplicateTexts(tx, original.texts, newAnnouncement.id);

    // Duplicate background
    if (original.background) {
      await this.duplicateBackground(tx, original.background, newAnnouncement.id);
    }

    // Duplicate page patterns
    await this.duplicatePagePatterns(tx, original.pagePatternLinks, newAnnouncement.id);

    return newAnnouncement;
  }

  private async duplicateTexts(tx: any, originalTexts: any[], newAnnouncementId: number) {
    for (const text of originalTexts) {
      const textValues = createTextValues(text, newAnnouncementId);
      const [newText] = await tx
        .insert(announcementText)
        .values(textValues)
        .returning();

      if (text.ctas?.length) {
        await this.duplicateCTAs(tx, text.ctas, newText.id);
      }
    }
  }

  private async duplicateCTAs(tx: any, originalCTAs: any[], newTextId: number) {
    for (const cta of originalCTAs) {
      const anyCtaOld = cta as any;
      
      const ctaValues: Omit<typeof callToAction.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'button' as const,
        text: cta.text,
        link: 'link' in cta ? anyCtaOld.link : '#',
        bgColor: 'bgColor' in cta ? anyCtaOld.bgColor : '#000000',
        textColor: cta.textColor,
        buttonRadius: 'buttonRadius' in cta && anyCtaOld.buttonRadius ? anyCtaOld.buttonRadius : 4,
        padding: 'padding' in cta && anyCtaOld.padding ? anyCtaOld.padding : '10px 20px',
        announcementTextId: newTextId
      };

      await tx.insert(callToAction).values(ctaValues);
    }
  }

  private async duplicateBackground(tx: any, originalBg: any, newAnnouncementId: number) {
    const bgValues: Omit<typeof bannerBackground.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
      backgroundColor: 'backgroundColor' in originalBg ? originalBg.backgroundColor : 'rgba(0,0,0,0)',
      backgroundType: 'backgroundType' in originalBg ? originalBg.backgroundType : 'solid',
      gradientValue: 'gradientValue' in originalBg ? originalBg.gradientValue : null,
      backgroundPattern: 'backgroundPattern' in originalBg ? originalBg.backgroundPattern : null,
      padding: 'padding' in originalBg && originalBg.padding ? originalBg.padding : '10px 15px',
      announcementId: newAnnouncementId
    };

    await tx.insert(bannerBackground).values(bgValues);
  }

  private async duplicatePagePatterns(tx: any, pagePatternLinks: any[], newAnnouncementId: number) {
    for (const link of pagePatternLinks) {
      const [pagePattern] = await tx
        .insert(pagePatterns)
        .values({ pattern: link.pagePattern.pattern })
        .returning();

      await tx.insert(announcementsXPagePatterns).values({
        pagePatternsID: pagePattern.id,
        announcementsID: newAnnouncementId
      });
    }
  }
}
