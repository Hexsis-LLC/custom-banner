import {
  sqliteTable,
  integer,
  text,
} from 'drizzle-orm/sqlite-core';

// Table definition
export const pagePatterns = sqliteTable('page_patterns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pattern: text('pattern').notNull().default("__global")
}); 