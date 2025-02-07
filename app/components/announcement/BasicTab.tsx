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

interface BasicTabProps {
  size: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  campaignTitle: string;
  customHeight: string;
  customWidth: string;
  onCampaignCustomHeight: (value: string) => void;
  onCampaignCustomWidth: (value: string) => void;
  onCampaignTitleChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

export function BasicTab({
  size,
  startDate,
  endDate,
  startTime,
  endTime,
  campaignTitle,
  onCampaignTitleChange,
  onSizeChange,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  customHeight,
  customWidth,
  onCampaignCustomWidth,
  onCampaignCustomHeight
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
                        {label: 'On specific date/time', value: 'specific'},
                      ]}
                      value="specific"
                    />
                    <InlineStack align={"space-between"}>
                      <div style={{width: '49%'}}>
                        <BlockStack gap="300">
                          <Text as="p" variant="bodyMd">Date</Text>
                          <DatePickerPopover
                            selectedDate={startDate}
                            onChange={onStartDateChange}
                            isModal={true}
                            label="Start date"
                          />
                        </BlockStack>
                      </div>
                      <div style={{width: '49%'}}>
                        <BlockStack gap="300">
                          <Text as="p" variant="bodyMd">Time (GMT+06:00)</Text>
                          <TextField
                            label="Start time"
                            labelHidden
                            value={startTime}
                            onChange={onStartTimeChange}
                            prefix={<Icon source="clock"/>}
                            autoComplete="off"
                          />
                        </BlockStack>
                      </div>
                    </InlineStack>
                  </BlockStack>
                </div>

                <div style={{width: '49%'}}>
                  <BlockStack gap="300">
                    <Text as="p" variant="bodyMd">End</Text>
                    <Select
                      label="End time type"
                      labelHidden
                      options={[
                        {label: 'On specific date/time', value: 'specific'},
                      ]}
                      value="specific"
                    />
                    <InlineStack align={"space-between"}>
                      <div style={{width: '49%'}}>
                        <BlockStack gap="300">
                          <Text as="p" variant="bodyMd">Date</Text>
                          <DatePickerPopover
                            selectedDate={endDate}
                            isModal={true}
                            onChange={onEndDateChange}
                            label="End date"
                          />
                        </BlockStack>
                      </div>
                      <div style={{width: '49%'}}>
                        <BlockStack gap="300">
                          <Text as="p" variant="bodyMd">Time (GMT+06:00)</Text>
                          <TextField
                            label="End time"
                            labelHidden
                            value={endTime}
                            onChange={onEndTimeChange}
                            prefix={<Icon source="clock"/>}
                            autoComplete="off"
                          />
                        </BlockStack>
                      </div>
                    </InlineStack>
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
