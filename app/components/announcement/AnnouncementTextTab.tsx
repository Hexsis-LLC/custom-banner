import {
  TextField,
  RadioButton,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  RangeSlider,
  Card,
  Box,
} from "@shopify/polaris";

interface AnnouncementTextTabProps {
  fontType: string;
  fontSize: number;
  onFontTypeChange: (value: string) => void;
  onFontSizeChange: (value: number) => void;
}

export function AnnouncementTextTab({
  fontType,
  fontSize,
  onFontTypeChange,
  onFontSizeChange,
}: AnnouncementTextTabProps) {
  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          {/* Message Section */}
          <BlockStack gap="400">
            <InlineStack align="start" gap="200">
              <Text variant="headingMd" as="h6">Message</Text>
              <Icon source="help" />
            </InlineStack>

            <TextField
              label="Text Message"
              labelHidden
              multiline={4}
              placeholder="Value"
              autoComplete="off"
            />
          </BlockStack>

          {/* Text Color and Font Size Section */}
          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <TextField
                label="Text Color"
                value="#FFFFFF"
                autoComplete="off"
                prefix="#"
              />
            </div>
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Font size</Text>
                <RangeSlider
                  label="Font size"
                  labelHidden
                  value={fontSize}
                  onChange={onFontSizeChange}
                  output
                  suffix="px"
                  min={12}
                  max={32}
                />
              </BlockStack>
            </div>
          </InlineStack>

          {/* Font Section */}
          <BlockStack gap="400">
            <Text variant="headingMd" as="h6">Font</Text>
            <InlineStack gap="300">
              <RadioButton
                label={
                  <BlockStack gap="100">
                    <Text variant="bodyMd" as="p">Site font</Text>
                    <Text variant="bodyMd" as="p" tone="subdued">Use the same font your store uses</Text>
                  </BlockStack>
                }
                checked={fontType === 'site'}
                id="site-font"
                name="font"
                onChange={() => onFontTypeChange('site')}
              />
              <RadioButton
                label={
                  <BlockStack gap="100">
                    <Text variant="bodyMd" as="p">Dynamic font</Text>
                    <Text variant="bodyMd" as="p" tone="subdued">Use the best looking font for all visitors</Text>
                  </BlockStack>
                }
                checked={fontType === 'dynamic'}
                id="dynamic-font"
                name="font"
                onChange={() => onFontTypeChange('dynamic')}
              />
              <RadioButton
                label="Custom font"
                checked={fontType === 'custom'}
                id="custom-font"
                name="font"
                onChange={() => onFontTypeChange('custom')}
              />
            </InlineStack>
          </BlockStack>

          {/* Custom Font Color Input */}
          {fontType === 'custom' && (
            <TextField
              label="Text Color"
              value="#FFFFFF"
              autoComplete="off"
              prefix="#"
            />
          )}

          {/* Custom Font Color Input */}
          {fontType === 'dynamic' && (
            <TextField
              label="Times New Roman"
              value="#FFFFFF"
              readOnly={true}
              autoComplete="off"
              prefix="#"
            />
          )}
        </BlockStack>
      </Box>
    </Card>
  );
}
