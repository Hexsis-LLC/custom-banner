import {
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  RadioButton,
  TextField,
  RangeSlider,
  Box,
  Select,
} from "@shopify/polaris";
import { useFormContext } from "../../../contexts/AnnouncementFormContext";

const patternOptions = [
  { label: 'None', value: 'none' },
  { label: 'Stripe Green', value: 'stripe-green' },
  { label: 'Stripe Blue', value: 'stripe-blue' },
];

export function BackgroundField() {
  const { formData, handleFormChange, hasError, getFieldErrorMessage } = useFormContext();

  const onBackgroundTypeChange = (value: 'solid' | 'gradient') => {
    handleFormChange('background', { backgroundType: value });
  };

  const onColor1Change = (value: string) => {
    handleFormChange('background', { color1: value });
  };

  const onColor2Change = (value: string) => {
    handleFormChange('background', { color2: value });
  };

  const onPatternChange = (value: string) => {
    handleFormChange('background', { pattern: value });
  };

  const onPaddingChange = (value: number, position: 'top' | 'right' | 'bottom' | 'left') => {
    const newPadding = { ...formData.background.padding, [position]: value };
    handleFormChange('background', { padding: newPadding });
  };

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack align="start" gap="200">
            <Text variant="headingMd" as="h6">Background</Text>
            <Icon source="help"/>
          </InlineStack>

          <InlineStack gap="300">
            <RadioButton
              label="Solid"
              checked={formData.background.backgroundType === 'solid'}
              id="solid"
              name="background"
              onChange={() => onBackgroundTypeChange('solid')}
            />
            <RadioButton
              label="Gradient"
              checked={formData.background.backgroundType === 'gradient'}
              id="gradient"
              name="background"
              onChange={() => onBackgroundTypeChange('gradient')}
            />
          </InlineStack>

          {formData.background.backgroundType === 'solid' ? (
            <TextField
              label="Color"
              value={formData.background.color1}
              onChange={onColor1Change}
              autoComplete="off"
              prefix="#"
              error={hasError('background.color1')}
              helpText={hasError('background.color1') ? getFieldErrorMessage('background.color1') : undefined}
            />
          ) : (
            <InlineStack gap="400" align="space-between">
              <div style={{width: '49%'}}>
                <TextField
                  label="Color 1"
                  value={formData.background.color1}
                  onChange={onColor1Change}
                  autoComplete="off"
                  prefix="#"
                  error={hasError('background.color1')}
                  helpText={hasError('background.color1') ? getFieldErrorMessage('background.color1') : undefined}
                />
              </div>
              <div style={{width: '49%'}}>
                <TextField
                  label="Color 2"
                  value={formData.background.color2}
                  onChange={onColor2Change}
                  autoComplete="off"
                  prefix="#"
                  error={hasError('background.color2')}
                  helpText={hasError('background.color2') ? getFieldErrorMessage('background.color2') : undefined}
                />
              </div>
            </InlineStack>
          )}

          <Select
            label="Pattern"
            options={patternOptions}
            value={formData.background.pattern}
            onChange={onPatternChange}
            error={hasError('background.pattern')}
          />
        </BlockStack>
      </Box>
      <Box padding="400">
        <BlockStack gap="400">
          <Text variant="headingMd" as="h6">Padding</Text>

          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Padding top</Text>
                <RangeSlider
                  label="Padding top"
                  labelHidden
                  value={formData.background.padding.top}
                  onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'top')}
                  output
                  prefix={formData.background.padding.top}
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
                  value={formData.background.padding.right}
                  onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'right')}
                  output
                  prefix={formData.background.padding.right}
                  suffix="px"
                  min={0}
                  max={50}
                />
              </BlockStack>
            </div>
          </InlineStack>

          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Padding bottom</Text>
                <RangeSlider
                  label="Padding bottom"
                  labelHidden
                  value={formData.background.padding.bottom}
                  onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'bottom')}
                  output
                  prefix={formData.background.padding.bottom}
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
                  value={formData.background.padding.left}
                  onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'left')}
                  output
                  prefix={formData.background.padding.left}
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