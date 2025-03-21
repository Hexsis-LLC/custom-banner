import {
  sqliteTable,
  integer,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { announcements } from './announcements';

// Table definition
export const afterTimerEnds = sqliteTable('after_timer_ends', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  announcementId: integer('announcement_id')
    .references(() => announcements.id)
    .notNull()
    .unique(),
  action: text('action', {
    enum: ['hide', 'show_zeros', 'create_announcement']
  }).notNull(),
  childAnnouncementId: integer('child_announcement_id')
    .references(() => announcements.id),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  announcementIdx: index('after_timer_announcement_idx').on(table.announcementId),
  childAnnouncementIdx: index('after_timer_child_idx').on(table.childAnnouncementId)
}));

// Relations
export const afterTimerEndsRelations = relations(afterTimerEnds, ({ one }) => ({
  announcement: one(announcements, {
    fields: [afterTimerEnds.announcementId],
    references: [announcements.id],
  }),
  childAnnouncement: one(announcements, {
    fields: [afterTimerEnds.childAnnouncementId],
    references: [announcements.id],
  }),
})); 