// schema.ts
import {
  sqliteTable,
  integer,
  text,
  index, primaryKey,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ====================== TABLES ======================
export const announcements = sqliteTable('announcements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['basic', 'countdown', 'email_signup', 'multi_text'] }).notNull(),
  title: text('title').notNull(),
  shopId: text('shop_id').notNull(),
  size: text('size', { enum: ['small', 'mid', 'large', 'custom'] }).notNull(),
  heightPx: integer('height_px'),
  widthPercent: integer('width_percent'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  showCloseButton: integer('show_close_button', { mode: 'boolean' }).default(true),
  closeButtonPosition: text('close_button_position', {
    enum: ['left', 'right', 'center']
  }).notNull(),
  countdownEndTime: text('countdown_end_time'),
  timezone: text('timezone').default('UTC'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true)
}, (table) => ({
  typeIdx: index('announcements_type_idx').on(table.type),
  dateIdx: index('announcements_date_idx').on(table.startDate, table.endDate),
  shopIdIdx: index('announcements_shop_idx').on(table.shopId) // Added index for shopId
}));

export const pagePatterns = sqliteTable('page_patterns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pattern: text('pattern').notNull().default("__global") // Ensure unique patterns
});

export const announcementsXPagePatterns = sqliteTable(
  'announcements_X_page_patterns',
  {
    pagePatternsID: integer('page_patterns_id')
      .notNull()
      .references(() => pagePatterns.id),
    announcementsID: integer('announcements_id')
      .notNull()
      .references(() => announcements.id),
  },
  (table) => ({
    pagePatternsIdx: index('page_patterns_idx').on(table.pagePatternsID),
    announcementsIdx: index('announcements_idx').on(table.announcementsID),
    compoundKey: primaryKey({ columns: [table.pagePatternsID, table.announcementsID] }) // Composite primary key
  })
);

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
    .notNull()
    .unique(), // Enforce 1:1 relationship
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

// ====================== RELATIONS ======================
export const announcementsRelations = relations(announcements, ({ many, one }) => ({
  texts: many(announcementText),
  background: one(bannerBackground, {
    fields: [announcements.id],
    references: [bannerBackground.announcementId],
  }),
  form: many(bannerForm),
  pagePatternLinks: many(announcementsXPagePatterns) // Updated to use junction table
}));

export const pagePatternsRelations = relations(pagePatterns, ({ many }) => ({
  announcementLinks: many(announcementsXPagePatterns) // Updated to use junction table
}));

export const announcementsXPagePatternsRelations = relations(announcementsXPagePatterns, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementsXPagePatterns.announcementsID],
    references: [announcements.id],
  }),
  pagePattern: one(pagePatterns, {
    fields: [announcementsXPagePatterns.pagePatternsID],
    references: [pagePatterns.id],
  }),
}));

export const announcementTextRelations = relations(announcementText, ({ one, many }) => ({
  announcement: one(announcements, {
    fields: [announcementText.announcementId],
    references: [announcements.id]
  }),
  ctas: many(callToAction)
}));

export const bannerBackgroundRelations = relations(bannerBackground, ({ one }) => ({
  announcement: one(announcements, {
    fields: [bannerBackground.announcementId],
    references: [announcements.id],
  }),
}));

export const bannerFormRelations = relations(bannerForm, ({ one }) => ({
  announcement: one(announcements, {
    fields: [bannerForm.announcementId],
    references: [announcements.id],
  }),
}));
