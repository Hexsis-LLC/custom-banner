import {
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  RadioButton,
  Box,
} from "@shopify/polaris";
import { useFormContext } from "../../../contexts/AnnouncementFormContext";

type Size = 'small' | 'mid' | 'large' | 'custom';

export function BannerSizeField() {
  const { formData, handleFormChange, hasError, getFieldErrorMessage } = useFormContext();
  
  const onSizeChange = (value: Size) => {
    handleFormChange('basic', { size: value });
  };

  const onCustomHeightChange = (value: string) => {
    handleFormChange('basic', { sizeHeight: value });
  };

  const onCustomWidthChange = (value: string) => {
    handleFormChange('basic', { sizeWidth: value });
  };

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack align="start" gap="200">
            <Text variant="headingMd" as="h6">Size</Text>
            <Icon source="help"/>
          </InlineStack>

          <InlineStack gap="300">
            <RadioButton
              label="Small"
              checked={formData.basic.size === 'small'}
              id="small"
              name="size"
              onChange={() => onSizeChange('small')}
            />
            <RadioButton
              label="Medium"
              checked={formData.basic.size === 'mid'}
              id="mid"
              name="size"
              onChange={() => onSizeChange('mid')}
            />
            <RadioButton
              label="Large"
              checked={formData.basic.size === 'large'}
              id="large"
              name="size"
              onChange={() => onSizeChange('large')}
            />
            <RadioButton
              label="Custom"
              checked={formData.basic.size === 'custom'}
              id="custom"
              name="size"
              onChange={() => onSizeChange('custom')}
            />
          </InlineStack>

          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <TextField
                label="Height"
                type="number"
                value={formData.basic.sizeHeight}
                onChange={onCustomHeightChange}
                suffix="px"
                autoComplete="off"
                disabled={formData.basic.size !== 'custom'}
                error={hasError('basic.sizeHeight')}
                helpText={hasError('basic.sizeHeight') ? getFieldErrorMessage('basic.sizeHeight') : undefined}
              />
            </div>
            <div style={{width: '49%'}}>
              <TextField
                label="Width"
                type="number"
                value={formData.basic.sizeWidth}
                suffix="%"
                onChange={onCustomWidthChange}
                autoComplete="off"
                disabled={formData.basic.size !== 'custom'}
                error={hasError('basic.sizeWidth')}
                helpText={hasError('basic.sizeWidth') ? getFieldErrorMessage('basic.sizeWidth') : undefined}
              />
            </div>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
} 