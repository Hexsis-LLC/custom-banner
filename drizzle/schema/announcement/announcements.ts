import {
  sqliteTable,
  integer,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Table definition
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

// Relations need to be defined after importing all related announcement to avoid circular references
// This is handled in the relations.ts file
