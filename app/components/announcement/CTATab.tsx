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

interface CTATabProps {
  ctaType: string;
  ctaText: string;
  ctaLink: string;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  fontType: string;
  fontSize: number;
  ctaButtonFontColor: string;
  ctaButtonBackgroundColor: string;
  onCtaButtonFontColorChange: (value: string) => void;
  onCtaButtonBackgroundColorChange: (value: string) => void;
  onCtaTypeChange: (value: string) => void;
  onCtaTextChange: (value: string) => void;
  onCtaLinkChange: (value: string) => void;
  onPaddingChange: (value: number, position: 'top' | 'right' | 'bottom' | 'left') => void;
  onFontTypeChange: (value: string) => void;
  onFontSizeChange: (value: number) => void;
}

export function CTATab({
  ctaType,
  ctaText,
  ctaLink,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  fontType,
  onCtaTypeChange,
  onCtaTextChange,
  onCtaLinkChange,
  onPaddingChange,
  onFontTypeChange,
  ctaButtonFontColor,
  ctaButtonBackgroundColor,
  onCtaButtonFontColorChange,
  onCtaButtonBackgroundColorChange,
}: CTATabProps) {
  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          {/* CTA Type Section */}
          <BlockStack gap="400">
            <InlineStack align="start" gap="200">
              <Text variant="headingMd" as="h6">CTA</Text>
              <Icon source="help"/>
            </InlineStack>

            <InlineStack gap="300">
              <RadioButton
                label="Clickable link"
                checked={ctaType === 'link'}
                id="link"
                name="cta"
                onChange={() => onCtaTypeChange('link')}
              />
              <RadioButton
                label="Clickable bar"
                checked={ctaType === 'bar'}
                id="bar"
                name="cta"
                onChange={() => onCtaTypeChange('bar')}
              />
              <RadioButton
                label="Regular Button"
                checked={ctaType === 'regular'}
                id="regular"
                name="cta"
                onChange={() => onCtaTypeChange('regular')}
              />
              <RadioButton
                label="None"
                checked={ctaType === 'none'}
                id="none"
                name="cta"
                onChange={() => onCtaTypeChange('none')}
              />
            </InlineStack>
          </BlockStack>

          {/* CTA Text and Link Section */}
          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <TextField
                label="Call to action text"
                value={ctaText}
                autoComplete="off"
                onChange={onCtaTextChange}
              />
            </div>
            <div style={{width: '49%'}}>
              <TextField
                label="Hyper Link"
                value={ctaLink}
                onChange={onCtaLinkChange}
                autoComplete="off"
              />
            </div>
          </InlineStack>

          {/* Button Colors Section */}
          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <TextField
                label="Button background"
                autoComplete="off"
                value={ctaButtonFontColor}
                onChange={onCtaButtonFontColorChange}
                prefix="#"
              />
            </div>
            <div style={{width: '49%'}}>
              <TextField
                label="Button text color"
                autoComplete="off"
                value={ctaButtonBackgroundColor}
                onChange={onCtaButtonBackgroundColorChange}
                prefix="#"
              />
            </div>
          </InlineStack>
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
          {/* Padding Top and Right Section */}
          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Padding top</Text>
                <RangeSlider
                  label="Padding top"
                  labelHidden
                  value={paddingTop}
                  onChange={(value) => onPaddingChange(value as number, 'top')}
                  output
                  suffix="px"
                  min={0}
                  max={50}
                />
              </BlockStack>
            </div>
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Padding right</Text>
                <RangeSlider
                  label="Padding right"
                  labelHidden
                  value={paddingRight}
                  onChange={(value) => onPaddingChange(value as number, 'right')}
                  output
                  suffix="px"
                  min={0}
                  max={50}
                />
              </BlockStack>
            </div>
          </InlineStack>

          {/* Padding Bottom and Left Section */}
          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Padding bottom</Text>
                <RangeSlider
                  label="Padding bottom"
                  labelHidden
                  value={paddingBottom}
                  onChange={(value) => onPaddingChange(value as number, 'bottom')}
                  output
                  suffix="px"
                  min={0}
                  max={50}
                />
              </BlockStack>
            </div>
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Padding left</Text>
                <RangeSlider
                  label="Padding left"
                  labelHidden
                  value={paddingLeft}
                  onChange={(value) => onPaddingChange(value as number, 'left')}
                  output
                  suffix="px"
                  min={0}
                  max={50}
                />
              </BlockStack>
            </div>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}
