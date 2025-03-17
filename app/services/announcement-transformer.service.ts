import type {
  DbAnnouncement,
  DbAnnouncementText,
  DbBannerBackground,
  DbBannerForm,
  DbCallToAction,
  DbPagePattern,
  GroupedAnnouncements,
  TransformedAnnouncement
} from '../types/announcement';

import {sanitizePatternForKey} from '../utils/announcement-utils';

// Define an augmented type that includes relations
export type AugmentedDbAnnouncement = DbAnnouncement & {
  texts: (DbAnnouncementText & {
    ctas: DbCallToAction[];
  })[];
  background: DbBannerBackground | null;
  form: DbBannerForm | null;
  pagePatternLinks: {
    pagePattern: DbPagePattern;
  }[];
};

/**
 * Service for transforming announcement data between different formats
 */
export class AnnouncementTransformerService {
  /**
   * Transforms a list of announcements into grouped format by patterns
   */
  async transformActiveAnnouncements(announcements: AugmentedDbAnnouncement[]): Promise<GroupedAnnouncements> {
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
      const {pagePatternLinks, ...cleanAnnouncement} = announcement;

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
        const cleanPattern = sanitizePatternForKey(pattern);
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
}
