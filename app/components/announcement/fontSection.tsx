import {
  TextField,
  RadioButton,
  Text,
  BlockStack,
  InlineStack,
  Button,

} from "@shopify/polaris";
import type {IFont} from "../../utils/google-fonts";
import CustomFonts from "../../utils/google-fonts";
import {useState, useCallback, useEffect, useRef} from "react";
import {RefreshIcon} from "@shopify/polaris-icons";

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
  const [font, setFont] = useState<IFont | null>(null);
  useRef(true);
// Initialize font when component mounts or fontUrl changes
  useEffect(() => {
    if (fontType === 'dynamic') {
      const fonts = new CustomFonts();
      if (fontUrl) {
        const fontData = fonts.getFontByUrl(fontUrl);
        if (fontData) {
          setFont(fontData);
        } else {
          // If font not found, generate a new one
          const randomFont = fonts.getRandomFont();
          setFont(randomFont);
          onFontUrlChange(randomFont.files.regular);
        }
      } else {
        // If no font URL, generate a new one
        const randomFont = fonts.getRandomFont();
        setFont(randomFont);
        onFontUrlChange(randomFont.files.regular);
      }
    } else {
      setFont(null);
    }
  }, [fontType, fontUrl, onFontUrlChange]);

  const handleFontTypeChange = useCallback((newFontType: string) => {
    if (newFontType === 'site') {
      // Clear font URL when switching to site font
      onFontUrlChange('');
      setFont(null);
    } else if (newFontType === 'custom' && !fontUrl) {
      // Initialize empty URL for custom font to trigger validation
      onFontUrlChange('');
      setFont(null);
    } else if (newFontType === 'dynamic') {
      // Generate initial font for dynamic type
      const fonts = new CustomFonts();
      const randomFont = fonts.getRandomFont();
      setFont(randomFont);
      onFontUrlChange(randomFont.files.regular);
    }
    onFontTypeChange(newFontType);
  }, [onFontTypeChange, onFontUrlChange, fontUrl]);

  const handleGenerateNewFont = useCallback(() => {
    const fonts = new CustomFonts();
    const randomFont = fonts.getRandomFont();
    setFont(randomFont);
    onFontUrlChange(randomFont.files.regular);
  }, [onFontUrlChange]);

  // Helper to check if URL field has error
  const hasUrlError = useCallback(() => {
    // Show error if custom font is selected and URL is empty
    if (fontType === 'custom' && !fontUrl?.trim()) {
      return true;
    }
    // Also show error if there's a validation error from the form context
    return hasError(`${errorPath}fontUrl`);
  }, [fontType, fontUrl, hasError, errorPath]);

  // Helper to get URL field error message
  const getUrlErrorMessage = useCallback(() => {
    // First check for form context validation errors
    if (hasError(`${errorPath}fontUrl`)) {
      return getFieldErrorMessage(`${errorPath}fontUrl`);
    }
    // Then check for empty URL when custom font is selected
    if (fontType === 'custom' && !fontUrl?.trim()) {
      return 'Font URL is required for custom font';
    }
    return '';
  }, [fontType, fontUrl, hasError, getFieldErrorMessage, errorPath]);

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h6">Font</Text>
      <BlockStack gap="300">
        <InlineStack gap="400" blockAlign="start">
          <RadioButton
            label="Site font"
            helpText="Use the same font your store uses"
            checked={fontType === 'site'}
            id="site-font"
            name="font"
            onChange={() => handleFontTypeChange('site')}
          />
          <RadioButton
            label="Dynamic font"
            helpText="Use the best looking font for all visitors"
            checked={fontType === 'dynamic'}
            id="dynamic-font"
            name="font"
            onChange={() => handleFontTypeChange('dynamic')}
          />
          <RadioButton
            label="Custom font"
            helpText="Enter your own font URL"
            checked={fontType === 'custom'}
            id="custom-font"
            name="font"
            onChange={() => handleFontTypeChange('custom')}
          />
        </InlineStack>

        {/* Font URL Input for Dynamic and Custom Fonts */}
        {(fontType === 'dynamic' || fontType === 'custom') && (
          <BlockStack gap="200">
            {font && (
              <InlineStack gap="400" blockAlign="center">
                <Text as="p" variant="bodyMd" tone="subdued">{font.family}</Text>
                {fontType === 'dynamic' && (
                  <Button
                    onClick={handleGenerateNewFont}
                    icon={RefreshIcon}
                    accessibilityLabel="Generate new font"
                  />
                )}
              </InlineStack>
            )}
            <TextField
              label={font ? 'Font URL' : 'Custom Font URL'}
              value={font?.files.regular ?? fontUrl}
              onChange={onFontUrlChange}
              autoComplete="off"
              readOnly={fontType === 'dynamic'}
              placeholder={fontType === 'custom' ? 'Enter font URL (required)' : undefined}
              error={hasUrlError()}
              helpText={hasUrlError() ? getUrlErrorMessage() : undefined}
            />
          </BlockStack>
        )}
      </BlockStack>
    </BlockStack>
  );
}
