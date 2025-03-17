import {
  sqliteTable,
  integer,
  text,
  index,
  primaryKey
} from 'drizzle-orm/sqlite-core';
import {relations} from 'drizzle-orm';
import {announcements} from './announcements';
import {pagePatterns} from './page-patterns';

// Table definition
export const announcementsXPagePatterns = sqliteTable(
  'announcements_X_page_patterns',
  {
    pagePatternsID: integer('page_patterns_id')
      .notNull()
      .references(() => pagePatterns.id),
    announcementsID: integer('announcements_id')
      .notNull()
      .references(() => announcements.id),
    createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    pagePatternsIdx: index('page_patterns_idx').on(table.pagePatternsID),
    announcementsIdx: index('announcements_idx').on(table.announcementsID),
    compoundKey: primaryKey({columns: [table.pagePatternsID, table.announcementsID]})
  })
);

// Relations
export const announcementsXPagePatternsRelations = relations(announcementsXPagePatterns, ({one}) => ({
  announcement: one(announcements, {
    fields: [announcementsXPagePatterns.announcementsID],
    references: [announcements.id],
  }),
  pagePattern: one(pagePatterns, {
    fields: [announcementsXPagePatterns.pagePatternsID],
    references: [pagePatterns.id],
  }),
}));
