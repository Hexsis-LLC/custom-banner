
export function getAppEmbedUrl(shop: string, themeId: string) {
  const shopName = shop.replace('.myshopify.com', '');
  return `https://admin.shopify.com/store/${shopName}/themes/${themeId}/editor?context=apps&appEmbed=e451d624-718c-470b-9466-778747ad40f5`;
}
