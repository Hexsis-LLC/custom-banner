import {
  sqliteTable,
  integer,
  text,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { announcements } from './announcements';

// Table definition
export const bannerForm = sqliteTable('banner_form', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  announcementId: integer('announcement_id')
    .references(() => announcements.id)
    .notNull(),
  inputType: text('input_type', { enum: ['email', 'text', 'checkbox'] }).notNull(),
  placeholder: text('placeholder'),
  label: text('label'),
  isRequired: integer('is_required', { mode: 'boolean' }).default(true),
  validationRegex: text('validation_regex')
});

// Relations
export const bannerFormRelations = relations(bannerForm, ({ one }) => ({
  announcement: one(announcements, {
    fields: [bannerForm.announcementId],
    references: [announcements.id],
  }),
})); 