import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const subscriptionPlanTable = sqliteTable('subscription_plan', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  billingCycle: text('billing_cycle').notNull(),
  trialDays: integer('trial_days').default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const subscriptionTable = sqliteTable('subscription', {
  id: text('id').primaryKey(),
  shop: text('shop').unique().notNull(),
  subscriptionPlanId: text('subscription_plan_id')
    .notNull()
    .references(() => subscriptionPlanTable.id),
  status: text('status').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  trialStart: text('trial_start'),
  trialEnd: text('trial_end'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});
