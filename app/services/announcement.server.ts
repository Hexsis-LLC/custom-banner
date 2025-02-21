import {and, eq, gte, lte, sql} from 'drizzle-orm';
import {inArray} from 'drizzle-orm/sql';
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
import {CloudflareKVService} from "./cloudflareKV.server";
import {
  CreateAnnouncementInput,
  AnnouncementCallToAction,
  AnnouncementFormField
} from '../types/announcement';

// Add these types before the AnnouncementService class
interface GroupedAnnouncements {
  global: Array<any>; // Using any for now since the announcement type is not fully defined
  __patterns: string[];
  [key: string]: Array<any> | string[]; // Index signature to allow dynamic page paths
}

export class AnnouncementService {
  private kvService: CloudflareKVService;
  constructor() {
    this.kvService = new CloudflareKVService();
  }

  private async transformActiveAnnouncements(announcements: any[]): Promise<GroupedAnnouncements> {
    const result: GroupedAnnouncements = {
      global: [],
      __patterns: []
    };

    // First pass: Group announcements and collect patterns that have announcements
    const patternsWithAnnouncements = new Set<string>();

    for (const announcement of announcements) {
      // Skip non-published or inactive announcements
      if (announcement.status !== 'published' || !announcement.isActive) {
        continue;
      }

      const { pagePatternLinks, ...cleanAnnouncement } = announcement;
      const patterns = pagePatternLinks.map(
        (link: { pagePattern: { pattern: string } }) => link.pagePattern.pattern
      );

      // Check if this announcement should be global
      if (patterns.includes('__global')) {
        result.global.push(cleanAnnouncement);
        continue; // Skip adding to other patterns if it's global
      }

      // Handle each pattern for the announcement
      for (const pattern of patterns) {
        const cleanPattern = pattern.replace('/', '_0x2F_').replace('*', '_0x2A_');
        // Skip global pattern as it's already handled
        if (cleanPattern === '__global') continue;

        // Initialize the array for this pattern if it doesn't exist
        if (!result[cleanPattern]) {
          result[cleanPattern] = [];
        }

        // Add the announcement to its pattern group if not already there
        const existingAnnouncement = (result[cleanPattern] as any[]).find(a => a.id === cleanAnnouncement.id);
        if (!existingAnnouncement) {
          (result[cleanPattern] as any[]).push(cleanAnnouncement);
          patternsWithAnnouncements.add(cleanPattern);
        }
      }
    }

    // Only include patterns that have announcements
    result.__patterns = Array.from(patternsWithAnnouncements).sort();

    return result;
  }

  async updateKv(shopId: string) {
    const allLatestAnnouncements = await this.getActiveAnnouncements(shopId);
    const groupedAnnouncements = await this.transformActiveAnnouncements(allLatestAnnouncements);
    console.log(allLatestAnnouncements)
    console.log(groupedAnnouncements)
    await this.kvService.updateAnnouncementsByShop(shopId, groupedAnnouncements);
  }

  async createAnnouncement(data: CreateAnnouncementInput) {
    const {
      texts,
      background,
      form,
      pagePatterns: patterns,
      ...announcementData
    } = data;
    console.log("logging status", announcementData.status)
    const result = await db.transaction(async (tx) => {
      // Create the announcement
      const [announcement] = await tx
        .insert(announcements)
        .values(announcementData)
        .returning();

      // Create texts and CTAs
      for (const text of texts) {
        const { callToActions, ...textData } = text;
        const [createdText] = await tx
          .insert(announcementText)
          .values({ ...textData, announcementId: announcement.id })
          .returning();

        if (callToActions?.length) {
          await tx.insert(callToAction).values(
            callToActions.map((cta: AnnouncementCallToAction) => ({
              ...cta,
              announcementTextId: createdText.id,
            }))
          );
        }
      }

      // Create background
      if (background) {
        await tx
          .insert(bannerBackground)
          .values({ ...background, announcementId: announcement.id });
      }

      // Create form fields if they exist
      if (form?.length) {
        await tx.insert(bannerForm).values(
          form.map((f: AnnouncementFormField) => ({
            ...f,
            announcementId: announcement.id,
          }))
        );
      }

      // Handle page patterns
      if (patterns?.length) {
        for (const pattern of patterns) {
          const [pagePattern] = await tx
            .insert(pagePatterns)
            .values({ pattern })
            .returning();

          await tx.insert(announcementsXPagePatterns).values({
            pagePatternsID: pagePattern.id,
            announcementsID: announcement.id,
          });
        }
      }
      return announcement;
    });
    console.log("---------------- Status: ", announcementData.status)
    if (announcementData.status === 'published') {
      await this.updateKv(announcementData.shopId);
    }
    return result;
  }

  async getAnnouncement(id: number) {
    return await db.query.announcements.findFirst({
      where: eq(announcements.id, id),
      with: {
        texts: {
          with: {
            ctas: true
          }
        },
        background: true,
        form: true,
        pagePatternLinks: {
          with: {
            pagePattern: true
          }
        }
      }
    });
  }

  async getActiveAnnouncements(shopId: string, currentPath?: string) {
    const now = new Date().toISOString();

    const activeAnnouncements = await db.query.announcements.findMany({
      where: and(
        eq(announcements.shopId, shopId),
        eq(announcements.isActive, true),
        eq(announcements.status, 'published'),
        lte(announcements.startDate, now),
        gte(announcements.endDate, now)
      ),
      with: {
        texts: {
          with: {
            ctas: true
          }
        },
        background: true,
        form: true,
        pagePatternLinks: {
          with: {
            pagePattern: true
          }
        }
      }
    });

    if (!currentPath) {
      return activeAnnouncements;
    }

    // Filter announcements based on page patterns if currentPath is provided
    return activeAnnouncements.filter((announcement: any) => {
      const patterns = announcement.pagePatternLinks.map(
        (link: { pagePattern: { pattern: string } }) => link.pagePattern.pattern
      );
      return (
        patterns.includes('__global') ||
        patterns.some((pattern: string) => {
          try {
            return new RegExp(pattern).test(currentPath);
          } catch {
            return false;
          }
        })
      );
    });
  }

  async updateAnnouncement(id: number, data: Partial<CreateAnnouncementInput>) {
    const {
      texts,
      background,
      form,
      pagePatterns: patterns,
      ...announcementData
    } = data;

    return await db.transaction(async (tx) => {
      // Update main announcement data
      if (Object.keys(announcementData).length > 0) {
        await tx
          .update(announcements)
          .set(announcementData)
          .where(eq(announcements.id, id));
      }

      // Update texts and CTAs if provided
      if (texts?.length) {
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
          const [newText] = await tx
            .insert(announcementText)
            .values({ ...textData, announcementId: id })
            .returning();

          if (callToActions?.length) {
            await tx.insert(callToAction).values(
              callToActions.map((cta: AnnouncementCallToAction) => ({
                ...cta,
                announcementTextId: newText.id,
              }))
            );
          }
        }
      }

      // Update background if provided
      if (background) {
        await tx
          .delete(bannerBackground)
          .where(eq(bannerBackground.announcementId, id));
        await tx
          .insert(bannerBackground)
          .values({ ...background, announcementId: id });
      }

      // Update form fields if provided
      if (form) {
        await tx.delete(bannerForm).where(eq(bannerForm.announcementId, id));
        if (form.length > 0) {
          await tx.insert(bannerForm).values(
            form.map((f: AnnouncementFormField) => ({
              ...f,
              announcementId: id,
            }))
          );
        }
      }

      // Update page patterns if provided
      if (patterns) {
        // Delete existing patterns
        await tx
          .delete(announcementsXPagePatterns)
          .where(eq(announcementsXPagePatterns.announcementsID, id));

        // Insert new patterns
        for (const pattern of patterns) {
          const [pagePattern] = await tx
            .insert(pagePatterns)
            .values({ pattern })
            .returning();

          await tx.insert(announcementsXPagePatterns).values({
            pagePatternsID: pagePattern.id,
            announcementsID: id,
          });
        }
      }

      return this.getAnnouncement(id);
    });
  }

  async deleteAnnouncement(id: number) {
    return await db.transaction(async (tx) => {
      // Delete related records first
      await tx
        .delete(announcementsXPagePatterns)
        .where(eq(announcementsXPagePatterns.announcementsID, id));

      const texts = await tx
        .select()
        .from(announcementText)
        .where(eq(announcementText.announcementId, id));

      for (const text of texts) {
        await tx
          .delete(callToAction)
          .where(eq(callToAction.announcementTextId, text.id));
      }

      await tx
        .delete(announcementText)
        .where(eq(announcementText.announcementId, id));
      await tx
        .delete(bannerBackground)
        .where(eq(bannerBackground.announcementId, id));
      await tx.delete(bannerForm).where(eq(bannerForm.announcementId, id));

      // Finally delete the announcement
      return tx.delete(announcements).where(eq(announcements.id, id));
    });
  }

  async toggleAnnouncementStatus(id: number, isActive: boolean) {
    return db
      .update(announcements)
      .set({isActive})
      .where(eq(announcements.id, id))
      .returning();
  }

  async getAnnouncementsByShop(shopId: string) {
    return await db.query.announcements.findMany({
      where: eq(announcements.shopId, shopId),
      with: {
        texts: {
          with: {
            ctas: true,
          },
        },
        background: true,
        form: true,
        pagePatternLinks: {
          with: {
            pagePattern: true,
          },
        },
      },
      orderBy: sql`${announcements.startDate} DESC`,
    });
  }

  async bulkDeleteAnnouncements(ids: number[]) {
    return await db.transaction(async (tx) => {
      // Delete all related records in a single query for each table
      await tx
        .delete(announcementsXPagePatterns)
        .where(inArray(announcementsXPagePatterns.announcementsID, ids));

      const texts = await tx
        .select()
        .from(announcementText)
        .where(inArray(announcementText.announcementId, ids));

      const textIds = texts.map(t => t.id);
      if (textIds.length) {
        await tx
          .delete(callToAction)
          .where(inArray(callToAction.announcementTextId, textIds));
      }

      await tx
        .delete(announcementText)
        .where(inArray(announcementText.announcementId, ids));

      await tx
        .delete(bannerBackground)
        .where(inArray(bannerBackground.announcementId, ids));

      await tx
        .delete(bannerForm)
        .where(inArray(bannerForm.announcementId, ids));

      // Finally delete the announcements
      return tx.delete(announcements).where(inArray(announcements.id, ids));
    });
  }

  async bulkUpdateAnnouncementStatus(ids: number[], status: 'draft' | 'published' | 'paused' | 'ended') {
    return await db.transaction(async (tx) => {
      return tx
        .update(announcements)
        .set({ status })
        .where(inArray(announcements.id, ids))
        .returning();
    });
  }

  async bulkDuplicateAnnouncements(ids: number[]) {
    return await db.transaction(async (tx) => {
      const originals = await Promise.all(
        ids.map(id => this.getAnnouncement(id))
      );

      const duplicatedAnnouncements = await Promise.all(
        originals
          .filter((original): original is NonNullable<typeof original> => original !== null)
          .map(async (original) => {
            // Create the base announcement
            const [newAnnouncement] = await tx
              .insert(announcements)
              .values({
                type: original.type,
                title: `${original.title} (copy)`,
                shopId: original.shopId,
                size: original.size,
                heightPx: original.heightPx ?? undefined,
                widthPercent: original.widthPercent ?? undefined,
                startDate: original.startDate,
                endDate: original.endDate,
                showCloseButton: Boolean(original.showCloseButton),
                closeButtonPosition: original.closeButtonPosition,
                countdownEndTime: original.countdownEndTime ?? undefined,
                timezone: original.timezone ?? undefined,
                isActive: original.isActive ?? undefined,
                status: 'draft'
              })
              .returning();

            // Duplicate texts and CTAs
            for (const text of original.texts) {
              const [newText] = await tx
                .insert(announcementText)
                .values({
                  textMessage: text.textMessage,
                  textColor: text.textColor,
                  fontSize: text.fontSize,
                  customFont: text.customFont ?? undefined,
                  languageCode: text.languageCode ?? undefined,
                  announcementId: newAnnouncement.id
                })
                .returning();

              if (text.ctas?.length) {
                await tx
                  .insert(callToAction)
                  .values(text.ctas.map(cta => ({
                    type: cta.type,
                    text: cta.text,
                    link: cta.link,
                    bgColor: cta.bgColor,
                    textColor: cta.textColor,
                    buttonRadius: cta.buttonRadius ?? undefined,
                    padding: cta.padding ?? undefined,
                    announcementTextId: newText.id
                  })));
              }
            }

            // Duplicate background
            if (original.background) {
              await tx
                .insert(bannerBackground)
                .values({
                  backgroundColor: original.background.backgroundColor,
                  backgroundPattern: original.background.backgroundPattern ?? undefined,
                  padding: original.background.padding ?? undefined,
                  announcementId: newAnnouncement.id
                });
            }

            // Duplicate page patterns
            for (const link of original.pagePatternLinks) {
              const [pagePattern] = await tx
                .insert(pagePatterns)
                .values({ pattern: link.pagePattern.pattern })
                .returning();

              await tx
                .insert(announcementsXPagePatterns)
                .values({
                  pagePatternsID: pagePattern.id,
                  announcementsID: newAnnouncement.id
                });
            }

            return newAnnouncement;
          })
      );

      return duplicatedAnnouncements;
    });
  }
}
