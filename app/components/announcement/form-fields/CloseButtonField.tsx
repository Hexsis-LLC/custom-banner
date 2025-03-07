import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  RadioButton,
  Box,
} from "@shopify/polaris";
import { useFormContext } from "../../../contexts/AnnouncementFormContext";
import { ColorPickerInput } from "app/components/ColorPickerInput";

export function CloseButtonField() {
  const { formData, handleFormChange } = useFormContext();

  const handleCloseButtonChange = (_checked: boolean, position: 'none' | 'left' | 'right') => {
    handleFormChange('basic', { 
      showCloseButton: position !== 'none',
      closeButtonPosition: position 
    });
  };

  const handleCloseButtonColorChange = (value: string) => {
    handleFormChange('basic', { closeButtonColor: value });
  };

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <Text variant="headingMd" as="h6">Close Button Settings</Text>
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              Show close button
            </Text>
            <InlineStack gap="400" align="start">
              <RadioButton
                label="Disabled"
                checked={!formData.basic.showCloseButton || formData.basic.closeButtonPosition === "none"}
                id="none"
                name="closeButton"
                onChange={(checked: boolean) => handleCloseButtonChange(checked, "none")}
              />
              <RadioButton
                label="Left"
                checked={formData.basic.showCloseButton && formData.basic.closeButtonPosition === "left"}
                id="left"
                name="closeButton"
                onChange={(checked: boolean) => handleCloseButtonChange(checked, "left")}
              />
              <RadioButton
                label="Right"
                checked={formData.basic.showCloseButton && formData.basic.closeButtonPosition === "right"}
                id="right"
                name="closeButton"
                onChange={(checked: boolean) => handleCloseButtonChange(checked, "right")}
              />
            </InlineStack>
          </BlockStack>

          {formData.basic.showCloseButton && formData.basic.closeButtonPosition !== "none" && (
            <BlockStack gap="200">
              <ColorPickerInput
                label="Close Button Color"
                value={formData.basic.closeButtonColor ?? "rgb(255, 255, 255)"}
                onChange={handleCloseButtonColorChange}
                type="solid"
              />
            </BlockStack>
          )}
        </BlockStack>
      </Box>
    </Card>
  );
}
