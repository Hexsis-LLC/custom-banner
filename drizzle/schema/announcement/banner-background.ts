import {
  sqliteTable,
  integer,
  text,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { announcements } from './announcements';

// Table definition
export const bannerBackground = sqliteTable('banner_background', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  announcementId: integer('announcement_id')
    .references(() => announcements.id)
    .notNull()
    .unique(),
  backgroundColor: text('bg_color').notNull(),
  backgroundType: text('background_type', { enum: ['solid', 'gradient'] }).notNull().default('solid'),
  gradientValue: text('gradient_value'),
  backgroundPattern: text('background_pattern'),
  padding: text('padding').default('10px 15px')
});

// Relations
export const bannerBackgroundRelations = relations(bannerBackground, ({ one }) => ({
  announcement: one(announcements, {
    fields: [bannerBackground.announcementId],
    references: [announcements.id],
  }),
})); 