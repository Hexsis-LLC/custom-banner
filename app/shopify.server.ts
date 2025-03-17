import '@shopify/shopify-app-remix/adapters/node';
import {
  ApiVersion,
  AppDistribution,
  LogSeverity,
  shopifyApp,
  BillingInterval
} from '@shopify/shopify-app-remix/server';
import {restResources} from '@shopify/shopify-api/rest/admin/2024-07';
import {db} from './db.server';
import {DrizzleSessionStorageSQLite} from 'packages/shopify-drizzle-sqlite/sqlite.adapter';
import {sessionTable} from 'packages/shopify-drizzle-sqlite/sqlite.schema';

// Define plan names as string literals with proper typing
export const FREE_PLAN = 'Free Plan' as const;
export const PRO_MONTHLY_PLAN = 'Pro Monthly Plan' as const;
export const PRO_YEARLY_PLAN = 'Pro Annual Plan' as const;

// Define a type for the plan names
export type PlanName = typeof FREE_PLAN | typeof PRO_MONTHLY_PLAN | typeof PRO_YEARLY_PLAN;

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
  apiVersion: ApiVersion.October24,
  privateAppStorefrontAccessToken: process.env.PRIVATE_APP_STOREFRONT_ACCESS_TOKEN,
  scopes: process.env.SCOPES?.split(','),
  appUrl: process.env.SHOPIFY_APP_URL || '',
  authPathPrefix: '/auth',
  sessionStorage: new DrizzleSessionStorageSQLite(db, sessionTable),
  distribution: AppDistribution.AppStore,
  restResources,
  future: {
    unstable_newEmbeddedAuthStrategy: false
  },

  logger: {
    level: LogSeverity.Debug,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
