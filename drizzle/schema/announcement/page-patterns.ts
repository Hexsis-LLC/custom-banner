import {
  sqliteTable,
  integer,
  text,
} from 'drizzle-orm/sqlite-core';
import {createInsertSchema, createSelectSchema, createUpdateSchema} from "drizzle-zod";

// Table definition
export const pagePatterns = sqliteTable('page_patterns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pattern: text('pattern').notNull().default("__global"),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const SelectPagePatternsSchema = createSelectSchema(pagePatterns);
export const InsertPagePatternsSchema = createInsertSchema(pagePatterns);
export const UpdatePagePatternsSchema = createUpdateSchema(pagePatterns);

