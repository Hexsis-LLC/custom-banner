import {
  sqliteTable,
  integer,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { announcementText } from './announcement-text';

// Table definition
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
  fontUrl: text('font_url'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  textIdx: index('cta_text_idx').on(table.announcementTextId)
}));

// Relations
export const callToActionRelations = relations(callToAction, ({ one }) => ({
  announcementText: one(announcementText, {
    fields: [callToAction.announcementTextId],
    references: [announcementText.id],
  }),
}));
