import {
  sqliteTable,
  integer,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { announcements } from './announcements';
import {createInsertSchema, createSelectSchema, createUpdateSchema} from "drizzle-zod";

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
  languageCode: text('language_code').default('en'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  announcementIdx: index('text_announcement_idx').on(table.announcementId)
}));


export const SelectAnnouncementTextSchema = createSelectSchema(announcementText);
export const InsertAnnouncementTextSchema = createInsertSchema(announcementText);
export const UpdateAnnouncementTextSchema = createUpdateSchema(announcementText);

