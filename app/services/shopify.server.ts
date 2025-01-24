import type {AdminApiContext} from "@shopify/shopify-app-remix/server";

export async function getShopInfo(admin: AdminApiContext) {
  const response = await admin.graphql(
    `query {
      shop {
        myshopifyDomain
      }
      themes(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }`
  );

  const data = await response.json();
  return {
    shopDomain: data.data.shop.myshopifyDomain,
    themeId: data.data.themes.edges[0]?.node.id.replace('gid://shopify/OnlineStoreTheme/', '')
  };
}

export async function getThemeAssets(admin: AdminApiContext, session: any, themeId: string) {
  const assets = await admin.rest.resources.Asset.all({
    session: session,
    theme_id: themeId,
    asset: {"key": "config/settings_data.json"},
  });

  return JSON.parse(assets.data[0].value as string)['current']['blocks'];
}
