import {
  TextField,
  RadioButton,
  Text,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import type {IFont} from "../../utils/google-fonts";
import CustomFonts from "../../utils/google-fonts";
import {useState} from "react";


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
  const [font, setFont] = useState<IFont | null>(null)
  const handleFontTypeChange = (value: string) => {

    onFontTypeChange(value);

    // Always set a random font when dynamic is selected
    if (value === 'dynamic') {
      const fonts = new CustomFonts();
      const randomFont = fonts.getRandomFont();

      setFont(randomFont);
      onFontUrlChange(randomFont.files.regular);
    }
    // Clear the URL when switching to site font
    else {
      setFont(null);
      onFontUrlChange('');
    }
  };

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
            onChange={() => handleFontTypeChange('site')}
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
            onChange={() => handleFontTypeChange('dynamic')}
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
          onChange={() => handleFontTypeChange('custom')}
        />
      </InlineStack>

      {/* Font URL Input for Dynamic and Custom Fonts */}
      {(fontType === 'dynamic' || fontType === 'custom') && (
        <BlockStack>
          <Text as="p" variant="bodyMd">{font?.family ?? 'Font URL'}</Text>
          <TextField
            label=""
            value={font?.files.regular ?? fontUrl}
            onChange={onFontUrlChange}
            autoComplete="off"
            readOnly={fontType === 'dynamic'}
            placeholder="Enter font URL"
            error={hasError(`${errorPath}.fontUrl`)}
            helpText={hasError(`${errorPath}.fontUrl`) ? getFieldErrorMessage(`${errorPath}.fontUrl`) : undefined}
          />
        </BlockStack>
      )}
    </BlockStack>
  );
}
