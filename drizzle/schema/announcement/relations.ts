import { relations } from 'drizzle-orm';
import {
  announcements,
  countdownSettings,
  afterTimerEnds,
  pagePatterns,
  announcementsXPagePatterns,
  announcementText,
  callToAction,
  bannerBackground,
  bannerForm,
} from './index';


// Define relations for announcement with circular dependencies
export const announcementsRelations = relations(announcements, ({ many, one }) => ({
  texts: many(announcementText),
  background: one(bannerBackground, {
    fields: [announcements.id],
    references: [bannerBackground.announcementId],
  }),
  form: many(bannerForm),
  pagePatternLinks: many(announcementsXPagePatterns),
  countdownSettings: one(countdownSettings, {
    fields: [announcements.id],
    references: [countdownSettings.announcementId],
  }),
  afterTimerSettings: one(afterTimerEnds, {
    fields: [announcements.id],
    references: [afterTimerEnds.announcementId],
  }),
  childAnnouncement: one(announcements, {
    fields: [announcements.childAnnouncementId],
    references: [announcements.id],
  }),
  parentAnnouncements: many(announcements, { relationName: 'childAnnouncement' }),
}));

export const pagePatternsRelations = relations(pagePatterns, ({ many }) => ({
  announcementLinks: many(announcementsXPagePatterns)
}));

export const announcementTextRelations = relations(announcementText, ({ one, many }) => ({
  announcement: one(announcements, {
    fields: [announcementText.announcementId],
    references: [announcements.id]
  }),
  ctas: many(callToAction)
}));



