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
  startType: text('start_type', { enum: ['now', 'specific'] }).notNull().default('now'),
  endType: text('end_type', { enum: ['until_stop', 'specific'] }).notNull().default('until_stop'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  showCloseButton: integer('show_close_button', { mode: 'boolean' }).default(true),
  closeButtonPosition: text('close_button_position', {
    enum: ['left', 'right', 'center', 'none']
  }).notNull(),
  closeButtonColor: text('close_button_color').notNull().default('rgb(255, 255, 255)'),
  timezone: text('timezone').default('UTC'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  status: text('status', { enum: ['draft', 'published', 'paused', 'ended'] }).notNull().default('draft'),
  displayBeforeDelay: text('display_before_delay').default('none'),
  showAfterClosing: text('show_after_closing').default('none'),
  showAfterCTA: text('show_after_cta').default('none'),
  childAnnouncementId: integer('child_announcement_id'),
}, (table) => ({
  typeIdx: index('announcements_type_idx').on(table.type),
  dateIdx: index('announcements_date_idx').on(table.startDate, table.endDate),
  shopIdIdx: index('announcements_shop_idx').on(table.shopId),
  statusIdx: index('announcements_status_idx').on(table.status),
}));

export const countdownSettings = sqliteTable('countdown_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  announcementId: integer('announcement_id')
    .references(() => announcements.id)
    .notNull()
    .unique(),
  timerType: text('timer_type', {
    enum: ['till_end_date', 'duration', 'daily_schedule']
  }).notNull(),
  timeFormat: text('time_format').default('HH:mm:ss'),
  showDays: integer('show_days', { mode: 'boolean' }).default(true),
  endDateTime: text('end_date_time'),
  durationDays: integer('duration_days'),
  durationHours: integer('duration_hours'),
  durationMinutes: integer('duration_minutes'),
  durationSeconds: integer('duration_seconds'),
  dailyStartTime: text('daily_start_time'),
  dailyEndTime: text('daily_end_time'),
}, (table) => ({
  announcementIdx: index('countdown_announcement_idx').on(table.announcementId)
}));

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
}, (table) => ({
  announcementIdx: index('after_timer_announcement_idx').on(table.announcementId)
}));

export const pagePatterns = sqliteTable('page_patterns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pattern: text('pattern').notNull().default("__global")
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
    compoundKey: primaryKey({ columns: [table.pagePatternsID, table.announcementsID] })
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
  fontType: text('font_type').notNull().default('site'),
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
  padding: text('padding').default('10px 20px'),
  fontType: text('font_type').notNull().default('site'),
  fontUrl: text('font_url')
});

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
  pagePatternLinks: many(announcementsXPagePatterns),
  countdownSettings: one(countdownSettings),
  afterTimerSettings: one(afterTimerEnds),
  childAnnouncement: one(announcements, {
    fields: [announcements.childAnnouncementId],
    references: [announcements.id],
    relationName: 'child_announcement'
  }),
}));

export const countdownSettingsRelations = relations(countdownSettings, ({ one }) => ({
  announcement: one(announcements, {
    fields: [countdownSettings.announcementId],
    references: [announcements.id],
  }),
}));

export const afterTimerEndsRelations = relations(afterTimerEnds, ({ one }) => ({
  announcement: one(announcements, {
    fields: [afterTimerEnds.announcementId],
    references: [announcements.id],
  }),
  childAnnouncement: one(announcements, {
    fields: [afterTimerEnds.childAnnouncementId],
    references: [announcements.id],
    relationName: 'child_announcement'
  }),
}));

export const pagePatternsRelations = relations(pagePatterns, ({ many }) => ({
  announcementLinks: many(announcementsXPagePatterns)
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

export const callToActionRelations = relations(callToAction, ({ one }) => ({
  announcementText: one(announcementText, {
    fields: [callToAction.announcementTextId],
    references: [announcementText.id],
  }),
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
