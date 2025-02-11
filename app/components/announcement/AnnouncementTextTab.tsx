import {
  TextField,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  RangeSlider,
  Card,
  Box,
} from "@shopify/polaris";
import { FontSection } from "./fontSection";

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
          <FontSection
            fontType={fontType}
            fontUrl={fontUrl}
            hasError={hasError}
            getFieldErrorMessage={getFieldErrorMessage}
            onFontTypeChange={onFontTypeChange}
            onFontUrlChange={onFontUrlChange}
            errorPath="text"
          />
        </BlockStack>
      </Box>
    </Card>
  );
}
