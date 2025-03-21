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
  countdownSettings,
} from '../../drizzle/schema/announcement';

// Define return types based on schema relationships
type Announcement = typeof announcements.$inferSelect;

// Type for child announcements with less nesting
type ChildAnnouncement = Announcement & {
  texts: (typeof announcementText.$inferSelect & {
    ctas: (typeof callToAction.$inferSelect)[]
  })[];
};

// Simplified child announcement type for filtered queries
type ChildAnnouncementPartial = Announcement & {
  texts: (typeof announcementText.$inferSelect)[];
};

type AnnouncementWithRelations = Announcement & {
  texts: (typeof announcementText.$inferSelect & {
    ctas: (typeof callToAction.$inferSelect)[]
  })[];
  background: typeof bannerBackground.$inferSelect;
  form: (typeof bannerForm.$inferSelect)[];
  pagePatternLinks: (typeof announcementsXPagePatterns.$inferSelect & {
    pagePattern: {
      pattern: string;
      id: number;
    }
  })[];
  countdownSettings: typeof countdownSettings.$inferSelect | null;
  childAnnouncement: ChildAnnouncement | null;
};

// A partial version of AnnouncementWithRelations that matches what's returned by getFilteredAnnouncementsByShop
type AnnouncementPartial = Announcement & {
  texts: (typeof announcementText.$inferSelect)[];
  background: typeof bannerBackground.$inferSelect;
  pagePatternLinks: (typeof announcementsXPagePatterns.$inferSelect & {
    pagePattern: {
      pattern: string;
      id: number;
    }
  })[];
  countdownSettings?: typeof countdownSettings.$inferSelect | null;
  childAnnouncement?: ChildAnnouncementPartial | null;
};

// SQLite delete operation can return various result formats
type SQLiteDeleteResult = any;

/**
 * Repository service for database operations related to announcements
 */
export class AnnouncementRepositoryService {
  /**
   * Fetches an announcement by ID with all related data
   */
  async getAnnouncement(id: number): Promise<AnnouncementWithRelations | undefined> {
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
        },
        countdownSettings: true,
        childAnnouncement: {
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

  /**
   * Fetches active announcements for a shop
   */
  async getActiveAnnouncements(shopId: string, currentPath?: string): Promise<AnnouncementWithRelations[]> {
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
        },
        countdownSettings: true,
        childAnnouncement: {
          with: {
            texts: {
              with: {
                ctas: true
              }
            },
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

  /**
   * Gets all announcements for a shop
   */
  async getAnnouncementsByShop(shopId: string): Promise<AnnouncementWithRelations[]> {
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
        countdownSettings: true,
        childAnnouncement: {
          with: {
            texts: {
              with: {
                ctas: true
              }
            },
          }
        }
      },
      orderBy: sql`${announcements.startDate}
      DESC`,
    });
  }

  /**
   * Gets filtered announcements for a shop with pagination
   */
  async getFilteredAnnouncementsByShop(
    shopId: string,
    tab: string,
    search: string,
    sort: string,
    page: number,
    limit: number
  ): Promise<{
    data: AnnouncementPartial[];
    totalCount: number;
  }> {
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
        sql`LOWER(
        ${announcements.title}
        )
        LIKE
        ${searchLower}
        OR
        LOWER
        (
        ${announcements.type}
        )
        LIKE
        ${searchLower}`
      );
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Determine sort direction
    const [, direction] = sort.split(" ");
    const sortOrder = direction === "asc"
      ? sql`${announcements.startDate}
      ASC`
      : sql`${announcements.startDate}
      DESC`;

    // Get total count with same filters (excluding pagination)
    const countResult = await db
      .select({count: sql`COUNT(*)`})
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
        countdownSettings: true,
        childAnnouncement: {
          with: {
            texts: {
              with: {
                ctas: true
              }
            },
          }
        }
      },
      orderBy: sortOrder,
      limit,
      offset,
    });

    return {data, totalCount};
  }

  /**
   * Bulk deletes announcements
   */
  async bulkDeleteAnnouncements(ids: number[]): Promise<SQLiteDeleteResult> {
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

      // Finally delete the announcements using the correct table reference
      return tx.delete(announcements).where(inArray(announcements.id, ids));
    });
  }

  /**
   * Bulk updates announcement status
   */
  async bulkUpdateAnnouncementStatus(ids: number[], status: 'draft' | 'published' | 'paused' | 'ended'): Promise<Announcement[]> {
    return await db.transaction(async (tx) => {
      return tx
        .update(announcements)
        .set({status})
        .where(inArray(announcements.id, ids))
        .returning();
    });
  }

  /**
   * Toggles an announcement's active status
   */
  async toggleAnnouncementStatus(id: number, isActive: boolean): Promise<Announcement[]> {
    return db
      .update(announcements)
      .set({isActive})
      .where(eq(announcements.id, id))
      .returning();
  }
}
