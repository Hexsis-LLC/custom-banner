import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Select,
  Box,
} from "@shopify/polaris";
import { useFormContext } from "../../../contexts/AnnouncementFormContext";

const delayOptions = [
  { label: 'None', value: 'none' },
  { label: '5 minutes', value: '5' },
  { label: '10 minutes', value: '10' },
  { label: '15 minutes', value: '15' },
  { label: '20 minutes', value: '20' },
  { label: '25 minutes', value: '25' },
  { label: '30 minutes', value: '30' },
];

const showAgainOptions = [
  { label: 'Never', value: 'none' },
  { label: 'After 1 day', value: '1' },
  { label: 'After 3 days', value: '3' },
  { label: 'After 7 days', value: '7' },
  { label: 'After 15 days', value: '15' },
  { label: 'After 30 days', value: '30' },
];

export function DisplayBehaviorField() {
  const { formData, handleFormChange } = useFormContext();

  const onDisplayBeforeDelayChange = (value: string) => {
    handleFormChange('other', { displayBeforeDelay: value || 'none' });
  };

  const onShowAfterClosingChange = (value: string) => {
    handleFormChange('other', { showAfterClosing: value || 'none' });
  };

  const onShowAfterCTAChange = (value: string) => {
    handleFormChange('other', { showAfterCTA: value || 'none' });
  };

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <Text variant="headingMd" as="h6">Display Behavior</Text>
          <InlineStack gap="400" align="start">
            <div style={{flex: 1}}>
              <Select
                label="Display before showing bar"
                options={delayOptions}
                onChange={onDisplayBeforeDelayChange}
                value={formData.other.displayBeforeDelay || 'none'}
              />
            </div>
            <div style={{flex: 1}}>
              <Select
                label="Show bar again after closing"
                options={showAgainOptions}
                onChange={onShowAfterClosingChange}
                value={formData.other.showAfterClosing || 'none'}
              />
            </div>
            <div style={{flex: 1}}>
              <Select
                label="Show bar again after CTA clicked"
                options={delayOptions}
                onChange={onShowAfterCTAChange}
                value={formData.other.showAfterCTA || 'none'}
              />
            </div>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
} 