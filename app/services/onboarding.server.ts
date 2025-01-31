import {db} from "../db.server";
import {onboardingTable} from "../../drizzle/schema/onboarding";
import {eq} from "drizzle-orm";
import type {Session} from "@shopify/shopify-api";
import type {AdminApiContext} from "@shopify/shopify-app-remix/server";

export async function initializeOnboarding(session: Session) {
  try {
    await db.insert(onboardingTable).values({
      shop: session.shop,
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).onConflictDoUpdate({
      target: onboardingTable.shop,
      set: {
        hasCompletedOnboarding: false,
        updatedAt: new Date().toISOString()
      }
    }).run();

    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to initialize onboarding");
  }
}

export async function completeOnboarding(session: Session) {
  try {
    await db.update(onboardingTable)
      .set({
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString()
      })
      .where(eq(onboardingTable.shop, session.shop))
      .run();

    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to complete onboarding");
  }
}

export async function getOnboardingStatus(session: Session) {
  try {
    return await db.select({
      hasCompletedEmbed: onboardingTable.hasCompletedEmbed,
      hasCompletedCreateNewBanner: onboardingTable.hasCompletedCreateNewBanner,
      hasCompletedOnboarding: onboardingTable.hasCompletedOnboarding,
    })
        .from(onboardingTable)
        .where(eq(onboardingTable.shop, session.shop))
        .get();
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch onboarding status");
  }
}

export async function updateOnboardingStep(session: Session, data: {
  hasCompletedEmbed?: boolean;
  hasCompletedCreateNewBanner?: boolean;
}) {
  try {
    await db.update(onboardingTable)
      .set({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .where(eq(onboardingTable.shop, session.shop))
      .run();

    return { success: true };
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to update onboarding step");
  }
}

export async function getShopAndThemeData(admin: AdminApiContext) {
  try {
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
      shop: data.data.shop.myshopifyDomain,
      themeId: data.data.themes.edges[0]?.node.id.replace('gid://shopify/OnlineStoreTheme/', '')
    };
  } catch (error) {
    console.error("GraphQL error:", error);
    throw new Error("Failed to fetch shop and theme data");
  }
}

interface ThemeBlock {
  type: string;
  disabled: boolean;
  settings: Record<string, unknown>;
}

interface ThemeBlocks {
  [key: string]: ThemeBlock;
}

interface ThemeSettings {
  current: {
    blocks: ThemeBlocks;
  };
}

function findBlockByType(blocks: ThemeBlocks, typeString: string) {
  if (!blocks || typeof blocks !== 'object') {
    throw new Error("Invalid blocks data");
  }

  const blockEntry = Object.entries(blocks).find(
    ([_, blockData]) => blockData.type.includes(typeString)
  );

  return blockEntry
    ? { blockId: blockEntry[0], blockData: blockEntry[1] }
    : null;
}

export async function checkAppEmbed(admin: AdminApiContext, session: Session, themeId: string) {
  try {
    const assets = await admin.rest.resources.Asset.all({
      session: session,
      theme_id: themeId,
      asset: {"key": "config/settings_data.json"},
    });

    if (!assets.data[0]?.value) {
      return false;
    }

    const themeSettings = JSON.parse(assets.data[0].value as string) as ThemeSettings;

    if (!themeSettings.current?.blocks) {
      return false;
    }

    const block = findBlockByType(
      themeSettings.current.blocks,
      'shopify://apps/custom-banner/blocks/custom_banner_emb'
    );
    if(block === null) {
      return false;
    }

    if (block && 'disabled' in block.blockData) {
      await updateOnboardingStep(session, {
        hasCompletedEmbed: !block.blockData.disabled
      });
      return !block.blockData.disabled;
    }

    return false;
  } catch (error) {
    console.error("Error checking app embed:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to check app embed status: ${error.message}`);
    }
    throw new Error("Failed to check app embed status");
  }
}
