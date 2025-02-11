import '@shopify/shopify-app-remix/adapters/node';
import {ApiVersion, AppDistribution, LogSeverity, shopifyApp} from '@shopify/shopify-app-remix/server';
import {restResources} from '@shopify/shopify-api/rest/admin/2024-07';
import {db} from './db.server';
import {DrizzleSessionStorageSQLite} from 'packages/shopify-drizzle-sqlite/sqlite.adapter';
import {sessionTable} from 'packages/shopify-drizzle-sqlite/sqlite.schema';

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
