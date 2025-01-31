import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

export const onboardingTable = sqliteTable('onboarding', {
  shop: text('shop').primaryKey(),
  hasCompletedOnboarding: integer('has_completed_onboarding', {mode: 'boolean'}).notNull().default(false),
  hasCompletedEmbed: integer('has_completed_embed', {mode: 'boolean'}).notNull().default(false),
  hasCompletedCreateNewBanner: integer('has_completed_create_new_banner', {mode: 'boolean'}).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export  type SQLiteOnboardingTable = typeof onboardingTable;
