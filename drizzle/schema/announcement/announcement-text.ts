import {
  sqliteTable,
  integer,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { announcements } from './announcements';

// Table definition
export const announcementText = sqliteTable('announcement_text', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  announcementId: integer('announcement_id')
    .references(() => announcements.id)
    .notNull(),
  textMessage: text('text_message').notNull(),
  textColor: text('text_color').notNull(),
  fontSize: integer('font_size').notNull(),
  customFont: text('custom_font'),
  fontType: text('font_type').notNull().default('site'),
  languageCode: text('language_code').default('en')
}, (table) => ({
  announcementIdx: index('text_announcement_idx').on(table.announcementId)
})); 