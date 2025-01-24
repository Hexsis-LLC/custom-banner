import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

export const onboardingTable = sqliteTable('onboarding', {
  shop: text('shop').primaryKey(),
  hasCompletedOnboarding: integer('hasCompletedOnboarding', {mode: 'boolean'}).notNull().default(false),
  hasCompletedEmbed: integer('hasCompletedEmbed', {mode: 'boolean'}).notNull().default(false),
  hasCompletedCreateNewBanner: integer('hasCompletedCreateNewBanner', {mode: 'boolean'}).notNull().default(false),
  createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updatedAt').notNull().$defaultFn(() => new Date().toISOString()),
});

export  type SQLiteOnboardingTable = typeof onboardingTable;
