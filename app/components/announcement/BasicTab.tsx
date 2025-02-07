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
  error?: boolean;
  errorMessage?: string;
  startDateError?: boolean;
  startDateErrorMessage?: string;
  startTimeError?: boolean;
  startTimeErrorMessage?: string;
  endDateError?: boolean;
  endDateErrorMessage?: string;
  endTimeError?: boolean;
  endTimeErrorMessage?: string;
  heightError?: boolean;
  heightErrorMessage?: string;
  widthError?: boolean;
  widthErrorMessage?: string;
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
  error,
  errorMessage,
  startDateError,
  startDateErrorMessage,
  startTimeError,
  startTimeErrorMessage,
  endDateError,
  endDateErrorMessage,
  endTimeError,
  endTimeErrorMessage,
  onCampaignTitleChange,
  onSizeChange,
  onStartTypeChange,
  onEndTypeChange,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  customHeight,
  customWidth,
  onCampaignCustomWidth,
  onCampaignCustomHeight,
  heightError,
  heightErrorMessage,
  widthError,
  widthErrorMessage
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
            error={error}
            helpText={error ? errorMessage : undefined}
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
                  error={heightError}
                  helpText={heightError ? heightErrorMessage : undefined}
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
                  error={widthError}
                  helpText={widthError ? widthErrorMessage : undefined}
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
                              error={startDateError}
                            />
                            {startDateError && startDateErrorMessage && (
                              <Text tone="critical" as="span">{startDateErrorMessage}</Text>
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
                              error={startTimeError}
                            />
                            {startTimeError && startTimeErrorMessage && (
                              <Text tone="critical" as="span">{startTimeErrorMessage}</Text>
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
                              error={endDateError}
                            />
                            {endDateError && endDateErrorMessage && (
                              <Text tone="critical" as="span">{endDateErrorMessage}</Text>
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
                              error={endTimeError}
                            />
                            {endTimeError && endTimeErrorMessage && (
                              <Text tone="critical" as="span">{endTimeErrorMessage}</Text>
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
