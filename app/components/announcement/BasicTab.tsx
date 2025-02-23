import {
  BlockStack,
  Box,
  Card,
} from "@shopify/polaris";
import { CampaignTitleField } from "./form-fields/CampaignTitleField";
import { BannerSizeField } from "./form-fields/BannerSizeField";
import { ScheduleCampaignField } from "./form-fields/ScheduleCampaignField";

export function BasicTab() {
  return (
    <BlockStack gap="300">
      <Card roundedAbove="sm">
        <Box padding="400">
          <CampaignTitleField />
        </Box>
      </Card>

      <BannerSizeField />
      <ScheduleCampaignField />
    </BlockStack>
  );
}
