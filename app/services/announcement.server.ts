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
  GroupedAnnouncements,
  TransformedAnnouncement,
  DbAnnouncement,
  DbAnnouncementText,
  DbBannerBackground,
  DbBannerForm,
  DbCallToAction,
  DbPagePattern,
} from '../types/announcement';

// Define an augmented type that includes relations
type AugmentedDbAnnouncement = DbAnnouncement & {
  texts: (DbAnnouncementText & {
    ctas: DbCallToAction[];
  })[];
  background: DbBannerBackground | null;
  form: DbBannerForm | null;
  pagePatternLinks: {
    pagePattern: DbPagePattern;
  }[];
};

// Database-specific text settings
export class AnnouncementService {
  private kvService: CloudflareKVService;
  constructor() {
    this.kvService = new CloudflareKVService();
  }

  private async transformActiveAnnouncements(announcements: AugmentedDbAnnouncement[]): Promise<GroupedAnnouncements> {
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

    // Use 'as unknown as AugmentedDbAnnouncement[]' to safely convert the type
    const groupedAnnouncements = await this.transformActiveAnnouncements(allLatestAnnouncements as unknown as AugmentedDbAnnouncement[]);
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

        // Create text using type-safe values
        const textValues: Omit<typeof announcementText.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
          textMessage: textData.textMessage,
          textColor: textData.textColor,
          fontSize: textData.fontSize,
          customFont: textData.customFont,
          fontType: textData.fontType || 'site',
          languageCode: textData.languageCode || 'en',
          announcementId: createdAnnouncement.id
        };

        const [createdText] = await tx
          .insert(announcementText)
          .values(textValues)
          .returning();

        if (callToActions?.length) {
          // Process each CTA individually to avoid type issues
          for (const cta of callToActions) {
            // Create CTA using type-safe values
            const ctaValues: Omit<typeof callToAction.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
              type: 'button' as const,
              text: cta.text,
              link: cta.url,
              bgColor: cta.buttonColor,
              textColor: cta.textColor,
              buttonRadius: 4,
              padding: '10px 20px',
              announcementTextId: createdText.id,
            };

            await tx.insert(callToAction).values(ctaValues);
          }
        }
      }

      // Create background
      if (background) {
        // Create background using type-safe values
        const bgValues: Omit<typeof bannerBackground.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
          backgroundColor: background.color || 'rgba(0,0,0,0)',
          backgroundType: background.type === 'gradient' ? 'gradient' : 'solid',
          gradientValue: background.gradientValue || (background.gradientStart && background.gradientEnd
            ? `linear-gradient(${background.gradientDirection || '90deg'}, ${background.gradientStart}, ${background.gradientEnd})`
            : undefined),
          backgroundPattern: background.imageUrl,
          padding: '10px 15px', // Default value
          announcementId: createdAnnouncement.id
        };

        console.log('Creating background with values:', {
          type: background.type,
          gradientValue: background.gradientValue,
          computedGradientValue: bgValues.gradientValue
        });

        await tx.insert(bannerBackground).values(bgValues);
      }

      // Create form if it exists
      if (form) {
        // Create form using type-safe values
        const formValues: Omit<typeof bannerForm.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
          inputType: form.formType === 'email' ? 'email' : 'text',
          placeholder: form.placeholderText,
          label: form.buttonText,
          isRequired: true,
          validationRegex: null,
          announcementId: createdAnnouncement.id,
        };

        await tx.insert(bannerForm).values(formValues);
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
        const linkValues: Omit<typeof announcementsXPagePatterns.$inferInsert, 'createdAt' | 'updatedAt'> = {
          pagePatternsID: pagePattern.id,
          announcementsID: createdAnnouncement.id,
        };

        await tx.insert(announcementsXPagePatterns).values(linkValues);
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

          // Create text using type-safe values
          const textValues: Omit<typeof announcementText.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
            textMessage: textData.textMessage,
            textColor: textData.textColor,
            fontSize: textData.fontSize,
            customFont: textData.customFont,
            fontType: textData.fontType || 'site',
            languageCode: textData.languageCode || 'en',
            announcementId: id
          };

          const [newText] = await tx
            .insert(announcementText)
            .values(textValues)
            .returning();

          if (callToActions?.length) {
            // Process each CTA individually
            for (const cta of callToActions) {
              // Create CTA using type-safe values
              const ctaValues: Omit<typeof callToAction.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
                type: 'button' as const,
                text: cta.text,
                link: cta.url,
                bgColor: cta.buttonColor,
                textColor: cta.textColor,
                buttonRadius: 4,
                padding: '10px 20px',
                announcementTextId: newText.id,
              };

              await tx.insert(callToAction).values(ctaValues);
            }
          }
        }
      }

      // Update background if provided
      if (background) {
        await tx
          .delete(bannerBackground)
          .where(eq(bannerBackground.announcementId, id));

        // Create background using type-safe values
        const bgValues: Omit<typeof bannerBackground.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
          backgroundColor: background.color || 'rgba(0,0,0,0)',
          backgroundType: background.type === 'gradient' ? 'gradient' : 'solid',
          gradientValue: background.gradientValue || (background.gradientStart && background.gradientEnd
            ? `linear-gradient(${background.gradientDirection || '90deg'}, ${background.gradientStart}, ${background.gradientEnd})`
            : undefined),
          backgroundPattern: background.imageUrl,
          padding: '10px 15px',
          announcementId: id
        };

        console.log('Creating background with values:', {
          type: background.type,
          gradientValue: background.gradientValue,
          computedGradientValue: bgValues.gradientValue
        });

        await tx.insert(bannerBackground).values(bgValues);
      }

      // Update form if provided
      if (form) {
        await tx.delete(bannerForm).where(eq(bannerForm.announcementId, id));

        // Create form using type-safe values
        const formValues: Omit<typeof bannerForm.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
          inputType: form.formType === 'email' ? 'email' : 'text',
          placeholder: form.placeholderText,
          label: form.buttonText,
          isRequired: true,
          validationRegex: null,
          announcementId: id
        };

        await tx.insert(bannerForm).values(formValues);
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

          const linkValues: Omit<typeof announcementsXPagePatterns.$inferInsert, 'createdAt' | 'updatedAt'> = {
            pagePatternsID: pagePattern.id,
            announcementsID: id,
          };

          await tx.insert(announcementsXPagePatterns).values(linkValues);
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

  async getFilteredAnnouncementsByShop(
    shopId: string,
    tab: string,
    search: string,
    sort: string,
    page: number,
    limit: number
  ) {
    // Create base filter conditions
    const baseConditions = [eq(announcements.shopId, shopId)];

    // Add filter by tab/status
    if (tab !== "all") {
      const now = new Date().toISOString();

      if (tab === "active") {
        baseConditions.push(eq(announcements.status, 'published'));
        baseConditions.push(gte(announcements.endDate, now));
      } else if (tab === "ended") {
        baseConditions.push(lte(announcements.endDate, now));
      } else {
        baseConditions.push(eq(announcements.status, tab as any));
      }
    }

    // Add search filter if provided
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      baseConditions.push(
        sql`LOWER(${announcements.title}) LIKE ${searchLower} OR LOWER(${announcements.type}) LIKE ${searchLower}`
      );
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Determine sort direction
    const [, direction] = sort.split(" ");
    const sortOrder = direction === "asc"
      ? sql`${announcements.startDate} ASC`
      : sql`${announcements.startDate} DESC`;

    // Get total count with same filters (excluding pagination)
    const countResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(announcements)
      .where(and(...baseConditions));

    const totalCount = Number(countResult[0]?.count || 0);

    // Get paginated and filtered data with minimal related records
    const data = await db.query.announcements.findMany({
      where: and(...baseConditions),
      with: {
        // Only include essential related data for the list view
        texts: true, // Include all text data but we'll limit downstream processing
        background: true,
        pagePatternLinks: {
          with: {
            pagePattern: true,
          },
        },
      },
      orderBy: sortOrder,
      limit,
      offset,
    });

    return { data, totalCount };
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
            // Create the base announcement - use type-safe values
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
            for (const text of original.texts) {
              // Create text using type-safe values
              const textValues: Omit<typeof announcementText.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
                textMessage: text.textMessage,
                textColor: text.textColor,
                fontSize: text.fontSize,
                customFont: text.customFont ?? undefined,
                fontType: text.fontType ?? 'site',
                languageCode: text.languageCode ?? undefined,
                announcementId: newAnnouncement.id
              };

              const [newText] = await tx
                .insert(announcementText)
                .values(textValues)
                .returning();

              if (text.ctas?.length) {
                // Process each CTA individually
                for (const cta of text.ctas) {
                  // Handle both old and new schema formats with type-safe values
                  const anyCtaOld = cta as any;

                  const ctaValues: Omit<typeof callToAction.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
                    type: 'button' as const,
                    text: cta.text,
                    link: 'link' in cta ? anyCtaOld.link : '#',
                    bgColor: 'bgColor' in cta ? anyCtaOld.bgColor : '#000000',
                    textColor: cta.textColor,
                    buttonRadius: 'buttonRadius' in cta && anyCtaOld.buttonRadius ? anyCtaOld.buttonRadius : 4,
                    padding: 'padding' in cta && anyCtaOld.padding ? anyCtaOld.padding : '10px 20px',
                    announcementTextId: newText.id
                  };

                  await tx.insert(callToAction).values(ctaValues);
                }
              }
            }

            // Duplicate background
            if (original.background) {
              const bg = original.background as any;

              // Type-safe values for background
              const bgValues: Omit<typeof bannerBackground.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
                backgroundColor: 'backgroundColor' in bg ? bg.backgroundColor : 'rgba(0,0,0,0)',
                backgroundType: 'backgroundType' in bg ? bg.backgroundType : 'solid',
                gradientValue: 'gradientValue' in bg ? bg.gradientValue : null,
                backgroundPattern: 'backgroundPattern' in bg ? bg.backgroundPattern : null,
                padding: 'padding' in bg && bg.padding ? bg.padding : '10px 15px',
                announcementId: newAnnouncement.id
              };

              await tx.insert(bannerBackground).values(bgValues);
            }

            // Duplicate page patterns
            for (const link of original.pagePatternLinks) {
              // Create page pattern with type-safe values
              const patternValues: Omit<typeof pagePatterns.$inferInsert, 'id' | 'createdAt' | 'updatedAt'> = {
                pattern: link.pagePattern.pattern
              };

              const [pagePattern] = await tx
                .insert(pagePatterns)
                .values(patternValues)
                .returning();

              // Create link using type-safe values
              const linkValues: Omit<typeof announcementsXPagePatterns.$inferInsert, 'createdAt' | 'updatedAt'> = {
                pagePatternsID: pagePattern.id,
                announcementsID: newAnnouncement.id
              };

              await tx.insert(announcementsXPagePatterns).values(linkValues);
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
      const anyAnnouncement = announcement as any;

      // Create a KVAnnouncement object
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
        closeButtonColor: announcement.closeButtonColor,
        timezone: announcement.timezone,
        isActive: announcement.isActive,
        status: announcement.status,
        displayBeforeDelay: announcement.displayBeforeDelay,
        showAfterClosing: announcement.showAfterClosing,
        showAfterCTA: announcement.showAfterCTA,
        // Map createdAt/updatedAt if they exist, otherwise use current date
        createdAt: anyAnnouncement.createdAt || new Date().toISOString(),
        updatedAt: anyAnnouncement.updatedAt || new Date().toISOString(),

        // Map text settings with new KVTextSettings interface
        texts: announcement.texts.map(text => {
          const anyText = text as any;

          return {
            id: text.id,
            announcementId: text.announcementId,
            textMessage: text.textMessage,
            textColor: text.textColor,
            fontSize: text.fontSize,
            customFont: text.customFont,
            fontType: anyText.fontType || 'site',
            languageCode: text.languageCode || 'en',
            createdAt: anyText.createdAt || new Date().toISOString(),
            updatedAt: anyText.updatedAt || new Date().toISOString(),

            // Map CTA settings with new KVCTASettings interface
            ctas: (text as any).ctas.map((cta: any) => {
              const anyCtaOld = cta;
              const anyCtaNew = cta;

              return {
                id: cta.id,
                announcementTextId: text.id,
                text: cta.text,
                url: anyCtaNew.url || anyCtaOld.link || '',
                textColor: cta.textColor,
                buttonColor: anyCtaNew.buttonColor || anyCtaOld.bgColor || '',
                openInNewTab: anyCtaNew.openInNewTab || true,
                position: anyCtaNew.position || 0,
                createdAt: anyCtaNew.createdAt || new Date().toISOString(),
                updatedAt: anyCtaNew.updatedAt || new Date().toISOString()
              };
            })
          };
        }),

        // Map background settings with new KVBackgroundSettings interface
        background: announcement.background ? (() => {
          const anyBgOld = announcement.background as any;
          const anyBgNew = announcement.background as any;

          return {
            id: announcement.background.id,
            announcementId: announcement.background.announcementId,
            type: (anyBgNew.type || (anyBgOld.backgroundType === 'gradient' ? 'gradient' : 'color')) as 'color' | 'gradient' | 'image',
            color: anyBgNew.color || anyBgOld.backgroundColor || '',
            gradientStart: anyBgNew.gradientStart || null,
            gradientEnd: anyBgNew.gradientEnd || null,
            gradientDirection: anyBgNew.gradientDirection || null,
            imageUrl: anyBgNew.imageUrl || anyBgOld.backgroundPattern || null,
            imagePosition: anyBgNew.imagePosition || null,
            imageSize: anyBgNew.imageSize || null,
            createdAt: anyBgNew.createdAt || new Date().toISOString(),
            updatedAt: anyBgNew.updatedAt || new Date().toISOString()
          };
        })() : null,

        // Map form settings with new KVFormField interface
        form: announcement.form ? (() => {
          const anyFormOld = announcement.form as any;
          const anyFormNew = announcement.form as any;

          return {
            id: announcement.form.id,
            announcementId: announcement.form.announcementId,
            formType: (anyFormNew.formType || (anyFormOld.inputType === 'email' ? 'email' : 'phone')) as 'email' | 'phone' | 'both',
            buttonText: anyFormNew.buttonText || anyFormOld.label || '',
            buttonColor: anyFormNew.buttonColor || '#000000',
            buttonTextColor: anyFormNew.buttonTextColor || '#FFFFFF',
            placeholderText: anyFormNew.placeholderText || anyFormOld.placeholder || null,
            successMessage: anyFormNew.successMessage || null,
            errorMessage: anyFormNew.errorMessage || null,
            createdAt: anyFormNew.createdAt || new Date().toISOString(),
            updatedAt: anyFormNew.updatedAt || new Date().toISOString()
          };
        })() : null
      };
    };

    // Convert each group of announcements
    return {
      global: groupedAnnouncements.global.map(convertAnnouncement) as any,
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
