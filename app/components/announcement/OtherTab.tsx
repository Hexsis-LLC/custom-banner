import { BlockStack } from "@shopify/polaris";
import { CloseButtonField } from "./form-fields/CloseButtonField";
import { DisplayBehaviorField } from "./form-fields/DisplayBehaviorField";
import { PageSelectionField } from "./form-fields/PageSelectionField";

interface OtherTabProps {
  pagesOptions: Array<{ label: string; value: string; }>;
}

export function OtherTab({ pagesOptions }: OtherTabProps) {
  return (
    <BlockStack gap="400">
      <CloseButtonField />
      <DisplayBehaviorField />
      <PageSelectionField pagesOptions={pagesOptions} />
    </BlockStack>
  );
}
