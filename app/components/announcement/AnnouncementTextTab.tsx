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
  announcementText: string;
  textColor: string;
  fontUrl?: string;
  hasError: (fieldPath: string) => boolean;
  getFieldErrorMessage: (fieldPath: string) => string;
  onAnnouncementTextChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  onFontTypeChange: (value: string) => void;
  onFontSizeChange: (value: number) => void;
  onFontUrlChange: (value: string) => void;
}

export function AnnouncementTextTab({
  fontType,
  fontSize,
  announcementText,
  textColor,
  fontUrl = '',
  hasError,
  getFieldErrorMessage,
  onAnnouncementTextChange,
  onTextColorChange,
  onFontTypeChange,
  onFontSizeChange,
  onFontUrlChange,
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
              value={announcementText}
              onChange={onAnnouncementTextChange}
              error={hasError('text.announcementText')}
              helpText={hasError('text.announcementText') ? getFieldErrorMessage('text.announcementText') : undefined}
            />
          </BlockStack>

          {/* Text Color and Font Size Section */}
          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <TextField
                label="Text Color"
                value={textColor}
                onChange={onTextColorChange}
                autoComplete="off"
                prefix="#"
                error={hasError('text.textColor')}
                helpText={hasError('text.textColor') ? getFieldErrorMessage('text.textColor') : undefined}
              />
            </div>
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Font size</Text>
                <RangeSlider
                  label="Font size"
                  labelHidden
                  prefix={fontSize}
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
              <InlineStack blockAlign={'start'}>
                <RadioButton
                  label=''
                  checked={fontType === 'site'}
                  id="site-font"
                  name="font"
                  onChange={() => onFontTypeChange('site')}
                />
                <BlockStack gap="100">
                  <Text variant="bodyMd" as="p">Site font</Text>
                  <Text variant="bodyMd" as="p" tone="subdued">Use the same font your store uses</Text>
                </BlockStack>
              </InlineStack>
              <InlineStack blockAlign={'start'}>
                <RadioButton
                  label=""
                  checked={fontType === 'dynamic'}
                  id="dynamic-font"
                  name="font"
                  onChange={() => onFontTypeChange('dynamic')}
                />
                <BlockStack gap="100">
                  <Text variant="bodyMd" as="p">Dynamic font</Text>
                  <Text variant="bodyMd" as="p" tone="subdued">Use the best looking font for all visitors</Text>
                </BlockStack>
              </InlineStack>
              <RadioButton
                label="Custom font"
                checked={fontType === 'custom'}
                id="custom-font"
                name="font"
                onChange={() => onFontTypeChange('custom')}
              />
            </InlineStack>

            {/* Font URL Input for Dynamic and Custom Fonts */}
            {(fontType === 'dynamic' || fontType === 'custom') && (
              <TextField
                label="Font URL"
                value={fontUrl}
                onChange={onFontUrlChange}
                autoComplete="off"
                placeholder="Enter font URL"
                error={hasError('text.fontUrl')}
                helpText={hasError('text.fontUrl') ? getFieldErrorMessage('text.fontUrl') : undefined}
              />
            )}
          </BlockStack>
        </BlockStack>
      </Box>
    </Card>
  );
}
