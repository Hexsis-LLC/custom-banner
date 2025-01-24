import {db} from "../db.server";
import {onboardingTable} from "../../drizzle/schema/onboarding";
import {eq} from "drizzle-orm";
import type {Blocks} from "../types/onboarding";

export async function getOnboardingStatus(shop: string) {
  return db.select({
    hasCompletedEmbed: onboardingTable.hasCompletedEmbed,
    hasCompletedCreateNewBanner: onboardingTable.hasCompletedCreateNewBanner,
  })
    .from(onboardingTable)
    .where(eq(onboardingTable.shop, shop))
    .get();
}

export async function updateEmbedStatus(shop: string, isEnabled: boolean) {
  await db.update(onboardingTable)
    .set({
      hasCompletedEmbed: isEnabled,
      updatedAt: new Date().toISOString()
    })
    .where(eq(onboardingTable.shop, shop))
    .run();
}

export async function updateBannerStatus(shop: string, skip: boolean = false) {
  await db.update(onboardingTable)
    .set({
      hasCompletedCreateNewBanner: true,
      hasCompletedOnboarding: !skip,
      updatedAt: new Date().toISOString()
    })
    .where(eq(onboardingTable.shop, shop))
    .run();
}

export function findAppBlock(blocks: Blocks) {
  if (!blocks || typeof blocks !== 'object') {
    throw new Error("Invalid blocks data.");
  }

  const block = Object.entries(blocks).find(
    ([_, blockData]) => blockData.type === 'shopify://apps/custom-banner/blocks/custom_banner_emb/e451d624-718c-470b-9466-778747ad40f5'
  );

  return block
    ? {blockId: block[0], blockData: block[1]}
    : null;
}
