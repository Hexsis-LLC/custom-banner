import {
  TextField,
  RadioButton,
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  Select,
  Box,
} from "@shopify/polaris";
import {DatePickerPopover} from "../DatePickerPopover";
import {TimePickerPopover} from "../TimePickerPopover";

interface BasicTabProps {
  size: string;
  startType: 'now' | 'specific';
  endType: 'specific' | 'until_stop';
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  campaignTitle: string;
  customHeight: string;
  customWidth: string;
  hasError: (fieldPath: string) => boolean;
  getFieldErrorMessage: (fieldPath: string) => string;
  onCampaignCustomHeight: (value: string) => void;
  onCampaignCustomWidth: (value: string) => void;
  onCampaignTitleChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onStartTypeChange: (value: 'now' | 'specific') => void;
  onEndTypeChange: (value: 'specific' | 'until_stop') => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

export function BasicTab({
  size,
  startType,
  endType,
  startDate,
  endDate,
  startTime,
  endTime,
  campaignTitle,
  customHeight,
  customWidth,
  hasError,
  getFieldErrorMessage,
  onCampaignTitleChange,
  onSizeChange,
  onStartTypeChange,
  onEndTypeChange,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onCampaignCustomHeight,
  onCampaignCustomWidth,
}: BasicTabProps) {
  return (
    <BlockStack gap="300">
      <Card roundedAbove="sm">
        <Box padding="400">
          <TextField
            label="Campaign Title"
            autoComplete="off"
            placeholder="Value"
            value={campaignTitle}
            onChange={onCampaignTitleChange}
            error={hasError('basic.campaignTitle')}
            helpText={hasError('basic.campaignTitle') ? getFieldErrorMessage('basic.campaignTitle') : undefined}
          />
        </Box>
      </Card>

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
                checked={size === 'small'}
                id="small"
                name="size"
                onChange={() => onSizeChange('small')}
              />
              <RadioButton
                label="Medium"
                checked={size === 'medium'}
                id="medium"
                name="size"
                onChange={() => onSizeChange('medium')}
              />
              <RadioButton
                label="Large"
                checked={size === 'large'}
                id="large"
                name="size"
                onChange={() => onSizeChange('large')}
              />
              <RadioButton
                label="Custom"
                checked={size === 'custom'}
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
                  value={customHeight}
                  onChange={onCampaignCustomHeight}
                  suffix="px"
                  autoComplete="off"
                  disabled={size !== 'custom'}
                  error={hasError('basic.sizeHeight')}
                  helpText={hasError('basic.sizeHeight') ? getFieldErrorMessage('basic.sizeHeight') : undefined}
                />
              </div>
              <div style={{width: '49%'}}>
                <TextField
                  label="Width"
                  type="number"
                  value={customWidth}
                  suffix="%"
                  onChange={onCampaignCustomWidth}
                  autoComplete="off"
                  disabled={size !== 'custom'}
                  error={hasError('basic.sizeWidth')}
                  helpText={hasError('basic.sizeWidth') ? getFieldErrorMessage('basic.sizeWidth') : undefined}
                />
              </div>
            </InlineStack>
          </BlockStack>
        </Box>
      </Card>

      <Card roundedAbove="sm">
        <Box padding="400">
          <BlockStack gap="400">
            <InlineStack align="start" gap="200">
              <Text variant="headingMd" as="h6">Schedule campaign</Text>
              <Icon source="help"/>
            </InlineStack>

            <BlockStack gap="400">
              <InlineStack gap="400" align="start">
                <div style={{width: '49%'}}>
                  <BlockStack gap="300">
                    <Text as="p" variant="bodyMd">Start</Text>
                    <Select
                      label="Start time type"
                      labelHidden
                      options={[
                        {label: 'Start from now', value: 'now'},
                        {label: 'On specific date/time', value: 'specific'},
                      ]}
                      value={startType}
                      onChange={(value) => onStartTypeChange(value as 'now' | 'specific')}
                    />
                    {startType === 'specific' && (
                      <InlineStack align={"space-between"}>
                        <div style={{width: '49%'}}>
                          <BlockStack gap="300">
                            <Text as="p" variant="bodyMd">Date</Text>
                            <DatePickerPopover
                              selectedDate={startDate || new Date()}
                              onChange={onStartDateChange}
                              isModal={false}
                              label="Start date"
                              error={hasError('basic.startDate')}
                            />
                            {hasError('basic.startDate') && (
                              <Text tone="critical" as="span">{getFieldErrorMessage('basic.startDate')}</Text>
                            )}
                          </BlockStack>
                        </div>
                        <div style={{width: '49%'}}>
                          <BlockStack gap="300">
                            <Text as="p" variant="bodyMd">Time (EST)</Text>
                            <TimePickerPopover
                              selectedTime={startTime || ''}
                              onChange={onStartTimeChange}
                              label="Start time"
                              error={hasError('basic.startTime')}
                            />
                            {hasError('basic.startTime') && (
                              <Text tone="critical" as="span">{getFieldErrorMessage('basic.startTime')}</Text>
                            )}
                          </BlockStack>
                        </div>
                      </InlineStack>
                    )}
                  </BlockStack>
                </div>

                <div style={{width: '49%'}}>
                  <BlockStack gap="300">
                    <Text as="p" variant="bodyMd">End</Text>
                    <Select
                      label="End time type"
                      labelHidden
                      options={[
                        {label: 'Until I stop', value: 'until_stop'},
                        {label: 'On specific date/time', value: 'specific'},
                      ]}
                      value={endType}
                      onChange={(value) => onEndTypeChange(value as 'specific' | 'until_stop')}
                    />
                    {endType === 'specific' && (
                      <InlineStack align={"space-between"}>
                        <div style={{width: '49%'}}>
                          <BlockStack gap="300">
                            <Text as="p" variant="bodyMd">Date</Text>
                            <DatePickerPopover
                              selectedDate={endDate || new Date()}
                              isModal={false}
                              onChange={onEndDateChange}
                              label="End date"
                              error={hasError('basic.endDate')}
                            />
                            {hasError('basic.endDate') && (
                              <Text tone="critical" as="span">{getFieldErrorMessage('basic.endDate')}</Text>
                            )}
                          </BlockStack>
                        </div>
                        <div style={{width: '49%'}}>
                          <BlockStack gap="300">
                            <Text as="p" variant="bodyMd">Time (EST)</Text>
                            <TimePickerPopover
                              selectedTime={endTime || ''}
                              onChange={onEndTimeChange}
                              label="End time"
                              error={hasError('basic.endTime')}
                            />
                            {hasError('basic.endTime') && (
                              <Text tone="critical" as="span">{getFieldErrorMessage('basic.endTime')}</Text>
                            )}
                          </BlockStack>
                        </div>
                      </InlineStack>
                    )}
                  </BlockStack>
                </div>
              </InlineStack>
            </BlockStack>
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );
}
