import {
  BlockStack,
  Card,
  InlineStack,
  RadioButton,
  RangeSlider,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import {useState, useCallback} from "react";

interface BackgroundTabProps {
  backgroundType: string;
  color1: string;
  color2: string;
  color3: string;
  pattern: string;
  paddingRight: number;
  onBackgroundTypeChange: (value: string) => void;
  onColor1Change: (value: string) => void;
  onColor2Change: (value: string) => void;
  onColor3Change: (value: string) => void;
  onPatternChange: (value: string) => void;
  onPaddingRightChange: (value: number) => void;
}

export function BackgroundTab({
  backgroundType,
  color1,
  color2,
  color3,
  pattern,
  paddingRight,
  onBackgroundTypeChange,
  onColor1Change,
  onColor2Change,
  onColor3Change,
  onPatternChange,
  onPaddingRightChange,
}: BackgroundTabProps) {
  const handleBackgroundTypeChange = useCallback(
    (checked: boolean, newValue: string) => {
      if (checked) {
        onBackgroundTypeChange(newValue);
      }
    },
    [onBackgroundTypeChange],
  );

  const patternOptions = [
    {label: 'Stripe (Green)', value: 'stripe-green'},
    {label: 'Stripe (Blue)', value: 'stripe-blue'},
    {label: 'Dots', value: 'dots'},
    {label: 'Waves', value: 'waves'},
  ];

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Background
          </Text>

          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              Select background color type
            </Text>
            <InlineStack gap="400" align="start">
              <RadioButton
                label="Solid"
                checked={backgroundType === "solid"}
                id="solid"
                name="backgroundType"
                onChange={(checked: boolean) => handleBackgroundTypeChange(checked, "solid")}
              />
              <RadioButton
                label="Gradient"
                checked={backgroundType === "gradient"}
                id="gradient"
                name="backgroundType"
                onChange={(checked: boolean) => handleBackgroundTypeChange(checked, "gradient")}
              />
            </InlineStack>
          </BlockStack>

          <BlockStack gap="400">
            <InlineStack gap="400">
              <div style={{flex: 1}}>
                <TextField
                  label="Color 1"
                  value={color1}
                  onChange={onColor1Change}
                  autoComplete="off"
                />
              </div>
              <div style={{flex: 1}}>
                <TextField
                  label="Color 2"
                  value={color2}
                  onChange={onColor2Change}
                  autoComplete="off"
                />
              </div>
              <div style={{flex: 1}}>
                <TextField
                  label="Color 3"
                  value={color3}
                  onChange={onColor3Change}
                  autoComplete="off"
                />
              </div>
            </InlineStack>

            <Select
              label="Pattern"
              options={patternOptions}
              onChange={onPatternChange}
              value={pattern}
            />

            <RangeSlider
              label="Padding right"
              value={paddingRight}
              onChange={onPaddingRightChange}
              output
              min={0}
              max={100}
              prefix={paddingRight}
              suffix="%"
            />
          </BlockStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
