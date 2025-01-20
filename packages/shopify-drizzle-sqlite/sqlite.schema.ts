import { text, sqliteTable, integer, blob } from 'drizzle-orm/sqlite-core';

export const sessionTable = sqliteTable('session' as string, {
  id: text('id').primaryKey(),
  shop: text('shop').notNull(),
  state: text('state').notNull(),
  isOnline: integer('isOnline', { mode: 'boolean' }).notNull().default(false),
  scope: text('scope'),
  expires: text('expires'),
  accessToken: text('accessToken'),
  userId: blob('userId', { mode: 'bigint' }),
});

export const onboardingTable = sqliteTable('onboarding', {
  shop: text('shop').primaryKey(),
  hasCompletedOnboarding: integer('hasCompletedOnboarding', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('createdAt').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updatedAt').notNull().$defaultFn(() => new Date().toISOString()),
});

export type SQLiteSessionTable = typeof sessionTable;
export type SQLiteOnboardingTable = typeof onboardingTable;