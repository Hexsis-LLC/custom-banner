import {
  BlockStack,

} from "@shopify/polaris";
import {AnnouncementTextField} from "./form-fields/AnnouncementTextField";
import {useFormContext} from "../../contexts/AnnouncementFormContext";

export function AnnouncementTextTab() {
  const {formData} = useFormContext();
  const isMultiText = formData.basic.type === 'multi_text';

  return (
    <BlockStack gap="400">
      <AnnouncementTextField isMultiText={isMultiText}/>
      {/* Future fields can be added here */}
      {isMultiText && (
        // Additional fields for multi-text type can be added here
        <></>
      )}
    </BlockStack>
  );
}
