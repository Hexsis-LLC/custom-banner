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
  Select,
} from "@shopify/polaris";

interface BackgroundTabProps {
  backgroundType: string;
  color1: string;
  color2: string;
  pattern: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  hasError: (fieldPath: string) => boolean;
  getFieldErrorMessage: (fieldPath: string) => string;
  onBackgroundTypeChange: (value: string) => void;
  onColor1Change: (value: string) => void;
  onColor2Change: (value: string) => void;
  onPatternChange: (value: string) => void;
  onPaddingChange: (value: number, position: 'top' | 'right' | 'bottom' | 'left') => void;
}

export function BackgroundTab({
  backgroundType,
  color1,
  color2,
  pattern,
  padding,
  hasError,
  getFieldErrorMessage,
  onBackgroundTypeChange,
  onColor1Change,
  onColor2Change,
  onPatternChange,
  onPaddingChange,
}: BackgroundTabProps) {

  const handlePaddingChange = (value: number | [number, number], position: 'top' | 'right' | 'bottom' | 'left') => {
    onPaddingChange(typeof value === 'number' ? value : value[1], position);
  };

  const patternOptions = [
    {label: 'None', value: 'none'},
    {label: 'Stripe Green', value: 'stripe-green'},
    {label: 'Stripe Blue', value: 'stripe-blue'},
  ];

  return (
    <BlockStack gap="300">
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
                checked={backgroundType === 'solid'}
                id="solid"
                name="background"
                onChange={() => onBackgroundTypeChange('solid')}
              />
              <RadioButton
                label="Gradient"
                checked={backgroundType === 'gradient'}
                id="gradient"
                name="background"
                onChange={() => onBackgroundTypeChange('gradient')}
              />
            </InlineStack>

            {backgroundType === 'solid' ? (
              <TextField
                label="Color"
                value={color1}
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
                    value={color1}
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
                    value={color2}
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
              value={pattern}
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
                    value={padding.top}
                    onChange={(value) => handlePaddingChange(value, 'top')}
                    output
                    prefix={padding.top}
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
                    value={padding.right}
                    onChange={(value) => handlePaddingChange(value, 'right')}
                    output
                    prefix={padding.right}
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
                    value={padding.bottom}
                    onChange={(value) => handlePaddingChange(value, 'bottom')}
                    output
                    prefix={padding.bottom}
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
                    value={padding.left}
                    onChange={(value) => handlePaddingChange(value, 'left')}
                    output
                    prefix={padding.left}
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
    </BlockStack>
  );
}
