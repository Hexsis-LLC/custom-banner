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
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  announcementIdx: index('countdown_announcement_idx').on(table.announcementId)
}));

// Relations
export const countdownSettingsRelations = relations(countdownSettings, ({ one }) => ({
  announcement: one(announcements, {
    fields: [countdownSettings.announcementId],
    references: [announcements.id],
  }),
}));

export const SelectCountdownSettingsSchema = createSelectSchema(countdownSettings);
export const InsertCountdownSettingsSchema = createInsertSchema(countdownSettings);
export const UpdateCountdownSettingsSchema = createUpdateSchema(countdownSettings);

