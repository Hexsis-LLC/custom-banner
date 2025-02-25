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
import {type AnnouncementKVData, CloudflareKVService} from "./cloudflareKV.server";
import type {
  CreateAnnouncementInput,
  DatabaseAnnouncement,
  GroupedAnnouncements,
  TransformedAnnouncement,
} from '../types/announcement';

// Database-specific text settings
export class AnnouncementService {
  private kvService: CloudflareKVService;
  constructor() {
    this.kvService = new CloudflareKVService();
  }

  private async transformActiveAnnouncements(announcements: DatabaseAnnouncement[]): Promise<GroupedAnnouncements> {
    console.log('Starting transformation with announcements:', announcements.map(a => ({
      id: a.id,
      status: a.status,
      isActive: a.isActive,
      startDate: a.startDate,
      endDate: a.endDate,
      hasPagePatternLinks: Array.isArray(a.pagePatternLinks),
      pagePatternLinksCount: a.pagePatternLinks?.length
    })));

    const result: GroupedAnnouncements = {
      global: [],
      __patterns: []
    };

    // First pass: Group announcements and collect patterns that have announcements
    const patternsWithAnnouncements = new Set<string>();

    for (const announcement of announcements) {
      // Ensure pagePatternLinks is an array
      if (!Array.isArray(announcement.pagePatternLinks)) {
        console.warn('Announcement has no pagePatternLinks:', announcement.id);
        continue;
      }

      // Skip non-published or inactive announcements
      if (announcement.status !== 'published' || announcement.isActive !== true) {
        console.log('Skipping announcement:', {
          id: announcement.id,
          status: announcement.status,
          isActive: announcement.isActive,
          reason: announcement.status !== 'published' ? 'not published' : 'not active'
        });
        continue;
      }

      // Create a clean announcement object without pagePatternLinks
      const { pagePatternLinks, ...cleanAnnouncement } = announcement;

      // Extract patterns from pagePatternLinks and ensure they're valid
      const patterns = pagePatternLinks
        .filter(link => link?.pagePattern?.pattern) // Filter out invalid patterns
        .map(link => link.pagePattern.pattern);

      console.log('Processing patterns for announcement:', {
        id: announcement.id,
        patternsFound: patterns.length,
        patterns
      });

      if (patterns.length === 0) {
        console.warn('No valid patterns found for announcement:', announcement.id);
        continue;
      }

      // Check if this announcement should be global
      if (patterns.includes('__global')) {
        console.log('Adding to global:', announcement.id);
        result.global.push(cleanAnnouncement);
        continue; // Skip adding to other patterns if it's global
      }

      // Handle each pattern for the announcement
      for (const pattern of patterns) {
        const cleanPattern = pattern.replace('/', '_0x2F_').replace('*', '_0x2A_');
        // Skip global pattern as it's already handled
        if (cleanPattern === '__global') continue;

        console.log('Processing pattern:', {
          announcementId: announcement.id,
          original: pattern,
          cleaned: cleanPattern
        });

        // Initialize the array for this pattern if it doesn't exist
        if (!result[cleanPattern]) {
          result[cleanPattern] = [];
          console.log('Created new pattern array:', cleanPattern);
        }

        // Add the announcement to its pattern group if not already there
        const announcementArray = result[cleanPattern] as TransformedAnnouncement[];
        const existingAnnouncement = announcementArray.find(a => a.id === cleanAnnouncement.id);
        if (!existingAnnouncement) {
          console.log('Adding to pattern:', {
            pattern: cleanPattern,
            announcementId: cleanAnnouncement.id
          });
          announcementArray.push(cleanAnnouncement);
          patternsWithAnnouncements.add(cleanPattern);
        }
      }
    }

    // Only include patterns that have announcements
    result.__patterns = Array.from(patternsWithAnnouncements).sort();

    console.log('Transformation complete. Final result:', {
      globalCount: result.global.length,
      globalAnnouncements: result.global.map(a => a.id),
      patternCount: result.__patterns.length,
      patterns: result.__patterns,
      allPatterns: Object.keys(result).filter(k => k !== 'global' && k !== '__patterns').map(pattern => ({
        pattern,
        count: (result[pattern] as TransformedAnnouncement[]).length,
        announcements: (result[pattern] as TransformedAnnouncement[]).map(a => a.id)
      }))
    });

    return result;
  }

  private async updateKv(shopId: string) {
    console.log('Starting KV update for shop:', shopId);

    const allLatestAnnouncements = await this.getActiveAnnouncements(shopId);
    console.log('Retrieved announcements:', allLatestAnnouncements.length);

    if (!allLatestAnnouncements.length) {
      console.log('No active announcements found');
      // Even if there are no announcements, we should update KV to clear any old data
      await this.kvService.updateAnnouncementsByShop(shopId, {
        global: [],
        __patterns: [],
      });
      return;
    }

    const groupedAnnouncements = await this.transformActiveAnnouncements(allLatestAnnouncements as DatabaseAnnouncement[]);
    console.log('Grouped announcements:', {
      globalCount: groupedAnnouncements.global.length,
      patterns: groupedAnnouncements.__patterns,
    });

    const kvData = this.convertToKVData(groupedAnnouncements);
    console.log('Converted KV data:', {
      globalCount: kvData.global.length,
      patterns: kvData.__patterns,
    });

    const result = await this.kvService.updateAnnouncementsByShop(shopId, kvData);
    console.log('KV update result:', result);

    if (!result) {
      console.error('Failed to update KV store');
      throw new Error('Failed to update KV store');
    }
  }

  async getAnnouncement(id: number) {
    console.log('Fetching announcement by id:', id);
    const announcement = await db.query.announcements.findFirst({
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

    console.log('Fetched announcement:', {
      found: !!announcement,
      id: announcement?.id,
      status: announcement?.status,
      isActive: announcement?.isActive,
      pagePatterns: announcement?.pagePatternLinks?.map(p => p.pagePattern.pattern)
    });

    return announcement;
  }

  async createAnnouncement(data: CreateAnnouncementInput) {
    console.log('Received announcement data:', JSON.stringify(data, null, 2));

    const {
      texts,
      background,
      form,
      pagePatterns: patterns = ['__global'], // Default to global if no patterns provided
      ...announcementData
    } = data;

    console.log('Creating announcement with data:', {
      status: announcementData.status,
      isActive: announcementData.isActive,
      startDate: announcementData.startDate,
      endDate: announcementData.endDate,
      patterns
    });

    // Validate required data
    if (!patterns?.length) {
      console.warn('No patterns provided, defaulting to __global');
      patterns.push('__global');
    }

    // Create the announcement first to get the ID
    const [createdAnnouncement] = await db
      .insert(announcements)
      .values({
        ...announcementData,
        // Ensure isActive is a boolean
        isActive: announcementData.isActive === true,
      })
      .returning();

    console.log('Created base announcement:', {
      id: createdAnnouncement.id,
      status: createdAnnouncement.status,
      isActive: createdAnnouncement.isActive
    });

    // Now create all related data in a transaction
    await db.transaction(async (tx) => {
      // Create texts and CTAs
      for (const text of texts) {
        const { callToActions, ...textData } = text;
        const [createdText] = await tx
          .insert(announcementText)
          .values({
            textMessage: textData.textMessage,
            textColor: textData.textColor,
            fontSize: textData.fontSize,
            customFont: textData.customFont,
            languageCode: textData.languageCode,
            announcementId: createdAnnouncement.id
          })
          .returning();

        if (callToActions?.length) {
          await tx.insert(callToAction).values(
            callToActions.map((cta) => ({
              type: cta.type,
              text: cta.text,
              link: cta.link,
              bgColor: cta.bgColor,
              textColor: cta.textColor,
              buttonRadius: cta.buttonRadius,
              padding: cta.padding,
              announcementTextId: createdText.id,
            }))
          );
        }
      }

      // Create background
      if (background) {
        await tx
          .insert(bannerBackground)
          .values({
            backgroundColor: background.backgroundColor,
            backgroundPattern: background.backgroundPattern,
            padding: background.padding,
            announcementId: createdAnnouncement.id
          });
      }

      // Create form fields if they exist
      if (form?.length) {
        await tx.insert(bannerForm).values(
          form.map((f) => ({
            inputType: f.inputType,
            placeholder: f.placeholder,
            label: f.label,
            isRequired: f.isRequired,
            validationRegex: f.validationRegex,
            announcementId: createdAnnouncement.id,
          }))
        );
      }

      // Always create at least one page pattern
      console.log('Creating page patterns:', patterns);
      for (const pattern of patterns) {
        // First try to find an existing pattern
        let pagePattern = await tx
          .select()
          .from(pagePatterns)
          .where(eq(pagePatterns.pattern, pattern))
          .then(rows => rows[0]);

        // If pattern doesn't exist, create it
        if (!pagePattern) {
          [pagePattern] = await tx
            .insert(pagePatterns)
            .values({ pattern })
            .returning();
        }

        console.log('Using page pattern:', {
          id: pagePattern.id,
          pattern: pagePattern.pattern
        });

        // Create the link
        await tx.insert(announcementsXPagePatterns).values({
          pagePatternsID: pagePattern.id,
          announcementsID: createdAnnouncement.id,
        });
      }
    });

    // Fetch the complete announcement after all data is created
    console.log('Fetching complete announcement after creation');
    const completeAnnouncement = await this.getAnnouncement(createdAnnouncement.id);

    if (!completeAnnouncement) {
      console.error('Failed to fetch complete announcement after creation:', createdAnnouncement.id);
      throw new Error('Failed to fetch complete announcement after creation');
    }

    console.log('Complete announcement:', {
      id: completeAnnouncement.id,
      status: completeAnnouncement.status,
      isActive: completeAnnouncement.isActive,
      pagePatterns: completeAnnouncement.pagePatternLinks.map(p => p.pagePattern.pattern)
    });

    // Only update KV if the announcement was created successfully and is published
    if (completeAnnouncement.status === 'published') {
      try {
        console.log('Updating KV for published announcement');
        await this.updateKv(announcementData.shopId);
      } catch (error) {
        console.error('Failed to update KV after creating announcement:', error);
        // Don't throw here as the announcement was created successfully
      }
    } else {
      console.log('Skipping KV update:', {
        status: completeAnnouncement.status
      });
    }

    return completeAnnouncement;
  }

  async getActiveAnnouncements(shopId: string, currentPath?: string) {
    const now = new Date().toISOString();

    console.log('Fetching active announcements with criteria:', {
      shopId,
      currentTime: now,
      currentPath
    });

    // First get all announcements that match the basic criteria
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

    console.log('Database query returned announcements:', activeAnnouncements.map(a => ({
      id: a.id,
      status: a.status,
      isActive: a.isActive,
      startDate: a.startDate,
      endDate: a.endDate,
      hasPagePatterns: a.pagePatternLinks?.length > 0,
      pagePatterns: a.pagePatternLinks?.map(p => p.pagePattern.pattern)
    })));

    // Validate each announcement has the required data
    const validAnnouncements = activeAnnouncements.filter(announcement => {
      const isValid = (
        announcement &&
        Array.isArray(announcement.pagePatternLinks) &&
        announcement.pagePatternLinks.length > 0 &&
        announcement.pagePatternLinks.every(link => link?.pagePattern?.pattern)
      );

      if (!isValid) {
        console.warn('Found invalid announcement:', {
          id: announcement.id,
          hasPagePatternLinks: Array.isArray(announcement.pagePatternLinks),
          pagePatternLinksCount: announcement.pagePatternLinks?.length,
          hasInvalidPatterns: announcement.pagePatternLinks?.some(link => !link?.pagePattern?.pattern)
        });
      }

      return isValid;
    });

    console.log('Valid announcements after filtering:', validAnnouncements.length);

    if (!currentPath) {
      return validAnnouncements;
    }

    // Filter announcements based on page patterns if currentPath is provided
    const pathFilteredAnnouncements = validAnnouncements.filter(announcement => {
      const patterns = announcement.pagePatternLinks.map(
        link => link.pagePattern.pattern
      );

      const matches = patterns.includes('__global') ||
        patterns.some(pattern => {
          try {
            const regex = new RegExp(pattern);
            const matches = regex.test(currentPath);
            console.log('Testing pattern:', {
              announcementId: announcement.id,
              pattern,
              path: currentPath,
              matches
            });
            return matches;
          } catch (error: any) { // Handle error as any since it's from RegExp
            console.warn('Invalid regex pattern:', {
              announcementId: announcement.id,
              pattern,
              error: error.message || String(error)
            });
            return false;
          }
        });

      console.log('Path matching result:', {
        announcementId: announcement.id,
        patterns,
        path: currentPath,
        matches
      });

      return matches;
    });

    console.log('Announcements after path filtering:', pathFilteredAnnouncements.length);
    return pathFilteredAnnouncements;
  }

  async updateAnnouncement(id: number, data: Partial<CreateAnnouncementInput>) {
    const {
      texts,
      background,
      form,
      pagePatterns: patterns,
      ...announcementData
    } = data;

    const result = await db.transaction(async (tx) => {
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
              callToActions.map((cta) => ({
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
            form.map((f) => ({
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

    // Get the updated announcement to check if we need to update KV
    const updatedAnnouncement = await this.getAnnouncement(id);
    if (updatedAnnouncement?.status === 'published') {
      try {
        await this.updateKv(updatedAnnouncement.shopId);
      } catch (error) {
        console.error('Failed to update KV after updating announcement:', error);
        // Don't throw here as the announcement was updated successfully
      }
    }

    return result;
  }

  async deleteAnnouncement(id: number) {
    // Get the announcement before deletion to get the shopId
    const announcement = await this.getAnnouncement(id);
    const shopId = announcement?.shopId;

    const result = await db.transaction(async (tx) => {
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

    // Update KV after successful deletion if we have the shopId
    if (shopId) {
      try {
        await this.updateKv(shopId);
      } catch (error) {
        console.error('Failed to update KV after deleting announcement:', error);
        // Don't throw here as the announcement was deleted successfully
      }
    }

    return result;
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
    // Get the announcements before deletion to get their shopIds
    const existingAnnouncements = await Promise.all(ids.map(id => this.getAnnouncement(id)));
    const shopIds = [...new Set(existingAnnouncements.filter(a => a !== null).map(a => a!.shopId))];

    const result = await db.transaction(async (tx) => {
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

      // Finally delete the announcements using the correct table reference
      return tx.delete(announcements).where(inArray(announcements.id, ids));
    });

    // Update KV for all affected shops
    await Promise.all(shopIds.map(async shopId => {
      try {
        await this.updateKv(shopId);
      } catch (error) {
        console.error('Failed to update KV after bulk deleting announcements for shop:', shopId, error);
        // Don't throw here as the announcements were deleted successfully
      }
    }));

    return result;
  }

  async bulkUpdateAnnouncementStatus(ids: number[], status: 'draft' | 'published' | 'paused' | 'ended') {
    const result = await db.transaction(async (tx) => {
      return tx
        .update(announcements)
        .set({ status })
        .where(inArray(announcements.id, ids))
        .returning();
    });

    // If status is published, we need to update KV for all affected shops
    if (status === 'published') {
      const shopIds = [...new Set(result.map(a => a.shopId))];
      await Promise.all(shopIds.map(async shopId => {
        try {
          await this.updateKv(shopId);
        } catch (error) {
          console.error('Failed to update KV after bulk updating announcement status for shop:', shopId, error);
          // Don't throw here as the announcements were updated successfully
        }
      }));
    }

    return result;
  }

  async bulkDuplicateAnnouncements(ids: number[]) {
    return await db.transaction(async (tx) => {
      const originals = await Promise.all(
        ids.map(id => this.getAnnouncement(id))
      );

      return await Promise.all(
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
                .values({pattern: link.pagePattern.pattern})
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
    });
  }

  // Helper method to convert GroupedAnnouncements to AnnouncementKVData
  private convertToKVData(groupedAnnouncements: GroupedAnnouncements): AnnouncementKVData {
    // Convert each announcement to the expected format
    const convertAnnouncement = (announcement: TransformedAnnouncement) => {
      return {
        id: announcement.id,
        type: announcement.type,
        title: announcement.title,
        shopId: announcement.shopId,
        size: announcement.size,
        heightPx: announcement.heightPx,
        widthPercent: announcement.widthPercent,
        startType: announcement.startType,
        endType: announcement.endType,
        startDate: announcement.startDate,
        endDate: announcement.endDate,
        showCloseButton: announcement.showCloseButton,
        closeButtonPosition: announcement.closeButtonPosition,
        countdownEndTime: announcement.countdownEndTime,
        timezone: announcement.timezone,
        isActive: announcement.isActive,
        displayBeforeDelay: announcement.displayBeforeDelay,
        showAfterClosing: announcement.showAfterClosing,
        showAfterCTA: announcement.showAfterCTA,
        texts: announcement.texts.map(text => ({
          id: text.id,
          announcementId: text.announcementId,
          textMessage: text.textMessage,
          textColor: text.textColor,
          fontSize: text.fontSize,
          customFont: text.customFont,
          languageCode: text.languageCode || 'en',
          ctas: text.ctas.map(cta => ({
            id: cta.id,
            announcementTextId: text.id,
            type: cta.type,
            text: cta.text,
            link: cta.link,
            bgColor: cta.bgColor,
            textColor: cta.textColor,
            buttonRadius: cta.buttonRadius,
            padding: cta.padding
          }))
        })),
        background: announcement.background ? {
          id: announcement.background.id,
          announcementId: announcement.background.announcementId,
          backgroundColor: announcement.background.backgroundColor,
          backgroundPattern: announcement.background.backgroundPattern,
          padding: announcement.background.padding
        } : null,
        form: announcement.form
      };
    };

    // Convert each group of announcements
    return {
      global: groupedAnnouncements.global.map(convertAnnouncement),
      __patterns: groupedAnnouncements.__patterns,
      ...Object.fromEntries(
        Object.entries(groupedAnnouncements)
          .filter(([key]) => key !== 'global' && key !== '__patterns')
          .map(([key, value]) => [
            key,
            (value as TransformedAnnouncement[]).map(convertAnnouncement)
          ])
      )
    };
  }
}
