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
import type { RangeSliderValue } from "@shopify/polaris/build/ts/src/components/RangeSlider/types";

interface CTATabProps {
  ctaType: string;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  onCtaTypeChange: (value: string) => void;
  onPaddingChange: (value: number, position: 'top' | 'right' | 'bottom' | 'left') => void;
}

export function CTATab({
  ctaType,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  onCtaTypeChange,
  onPaddingChange,
}: CTATabProps) {
  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          {/* CTA Type Section */}
          <BlockStack gap="400">
            <InlineStack align="start" gap="200">
              <Text variant="headingMd" as="h6">CTA</Text>
              <Icon source="help" />
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
                value="Go to link"
                autoComplete="off"
              />
            </div>
            <div style={{width: '49%'}}>
              <TextField
                label="Hyper Link"
                value="www.google.com"
                autoComplete="off"
              />
            </div>
          </InlineStack>

          {/* Button Colors Section */}
          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <TextField
                label="Button background"
                value="#FFFFFF"
                autoComplete="off"
                prefix="#"
              />
            </div>
            <div style={{width: '49%'}}>
              <TextField
                label="Button text color"
                value="#FFFFFF"
                autoComplete="off"
                prefix="#"
              />
            </div>
          </InlineStack>

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
