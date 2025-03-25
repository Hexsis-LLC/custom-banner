import {
  sqliteTable,
  integer,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { announcements } from './announcements';
import {createInsertSchema, createSelectSchema, createUpdateSchema} from "drizzle-zod";

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
  validationRegex: text('validation_regex'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  announcementIdx: index('form_announcement_idx').on(table.announcementId)
}));

// Relations
export const bannerFormRelations = relations(bannerForm, ({ one }) => ({
  announcement: one(announcements, {
    fields: [bannerForm.announcementId],
    references: [announcements.id],
  }),
}));

export const SelectBannerFormSchema = createSelectSchema(bannerForm);
export const InsertBannerFormSchema = createInsertSchema(bannerForm);
export const UpdateBannerFormSchema = createUpdateSchema(bannerForm);

