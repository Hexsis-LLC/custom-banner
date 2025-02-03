// schema.ts
import {
  sqliteTable,
  integer,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';


export const announcements = sqliteTable('announcements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['basic', 'countdown', 'email_signup',"multi_text"] }).notNull(),
  title: text('title').notNull(),
  shop: text('shop').notNull(),
  size: text('size', { enum: ['small', 'mid', 'large', 'custom'] }).notNull(),
  heightPx: integer('height_px'),
  widthPercent: integer('width_percent'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  showCloseButton: integer('show_close_button', { mode: 'boolean' }).default(true),
  closeButtonPosition: text('close_button_position', {
    enum: ['left', 'right', 'center']
  }).notNull(),
  specificPage: text('specific_page'),
  countdownEndTime: text('countdown_end_time'),
  timezone: text('timezone').default('UTC'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true)
}, (table) => ({
  typeIdx: index('announcements_type_idx').on(table.type),
  dateIdx: index('announcements_date_idx').on(table.startDate, table.endDate)
}));

export const announcementText = sqliteTable('announcement_text', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  announcementId: integer('announcement_id')
    .references(() => announcements.id)
    .notNull(),
  textMessage: text('text_message').notNull(),
  textColor: text('text_color').notNull(),
  fontSize: integer('font_size').notNull(),
  customFont: text('custom_font'),
  languageCode: text('language_code').default('en')
}, (table) => ({
  announcementIdx: index('text_announcement_idx').on(table.announcementId)
}));

export const callToAction = sqliteTable('call_to_action', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  announcementTextId: integer('announcement_text_id')
    .references(() => announcementText.id)
    .notNull(),
  type: text('type', { enum: ['button', 'text'] }).notNull(),
  text: text('text').notNull(),
  link: text('link').notNull(),
  bgColor: text('bg_color').notNull(),
  textColor: text('text_color').notNull(),
  buttonRadius: integer('button_radius').default(4),
  padding: text('padding').default('10px 20px')
});

export const bannerBackground = sqliteTable('banner_background', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  announcementId: integer('announcement_id')
    .references(() => announcements.id)
    .notNull(),
  backgroundColor: text('bg_color').notNull(),
  backgroundPattern: text('background_pattern'),
  padding: text('padding').default('10px 15px')
});

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


export const announcementsRelations = relations(announcements, ({ many,one }) => ({
  texts: many(announcementText),
  backgrounds: one(bannerBackground),
  form: many(bannerForm)
}));

export const announcementTextRelations = relations(announcementText, ({ one, many }) => ({
  announcement: one(announcements, {
    fields: [announcementText.announcementId],
    references: [announcements.id]
  }),
  ctas: many(callToAction)
}));
