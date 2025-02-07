import {
  TextField,
  RadioButton,
  Text,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";

interface FontSectionProps {
  fontType: string;
  fontUrl?: string;
  hasError: (fieldPath: string) => boolean;
  getFieldErrorMessage: (fieldPath: string) => string;
  onFontTypeChange: (value: string) => void;
  onFontUrlChange: (value: string) => void;
  errorPath: string;
}

export function FontSection({
  fontType,
  fontUrl = '',
  hasError,
  getFieldErrorMessage,
  onFontTypeChange,
  onFontUrlChange,
  errorPath,
}: FontSectionProps) {
  return (
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
          error={hasError(`${errorPath}.fontUrl`)}
          helpText={hasError(`${errorPath}.fontUrl`) ? getFieldErrorMessage(`${errorPath}.fontUrl`) : undefined}
        />
      )}
    </BlockStack>
  );
} 