import type {StorefrontContext} from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";

export default class Storefront {
  private storeFont: StorefrontContext

  constructor(storeFont: StorefrontContext) {
    this.storeFont = storeFont
  }

  async getStorePages(){
    const pages = [
      { title: "Cart", handle: "cart" },
      { title: "Checkout", handle: "checkout" },
      { title: "Search", handle: "search" },
      { title: "Account", handle: "account" },
      { title: "Login", handle: "account/login" },
      { title: "Register", handle: "account/register" },
      { title: "Orders", handle: "account/orders" },
      { title: "Product Page", handle: "products/*" },
      { title: "Collection Page", handle: "collections/*" },
    ];

    const response = await this.storeFont.graphql(
      `#graphql
  query products {
    pages(first: 250) {
      edges {
        node {
         title
          handle
        }
      }
    }
  }`,
    );

    const data = await response.json();
    data.data.pages.edges.forEach((node: {title: string, handle: string}) => {
      pages.push({ title: node.title, handle: `pages/${node.handle}` });
    })
    return pages
  }
}
