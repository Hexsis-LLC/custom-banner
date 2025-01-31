import {
  TextField,
  RadioButton,
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  Select,
  DatePicker,
  Box,
  Popover,
} from "@shopify/polaris";
import {useState, useRef, useCallback} from "react";

interface BasicTabProps {
  size: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  onSizeChange: (value: string) => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

interface DateChangeEvent {
  end: Date;
}

export function BasicTab({
                           size,
                           startDate,
                           endDate,
                           startTime,
                           endTime,
                           onSizeChange,
                           onStartDateChange,
                           onEndDateChange,
                         }: BasicTabProps) {
  const [startDatePickerActive, setStartDatePickerActive] = useState(false);
  const [endDatePickerActive, setEndDatePickerActive] = useState(false);

  const [{startMonth, startYear}, setStartDate] = useState({
    startMonth: startDate.getMonth(),
    startYear: startDate.getFullYear(),
  });

  const [{endMonth, endYear}, setEndDate] = useState({
    endMonth: endDate.getMonth(),
    endYear: endDate.getFullYear(),
  });

  const handleStartMonthChange = useCallback(
    (month: number, year: number) => setStartDate({startMonth: month, startYear: year}),
    [],
  );

  const handleEndMonthChange = useCallback(
    (month: number, year: number) => setEndDate({endMonth: month, endYear: year}),
    [],
  );

  const handleStartDateChange = useCallback(({end: newDate}: DateChangeEvent) => {
    onStartDateChange(newDate);
    setStartDatePickerActive(false);
  }, [onStartDateChange]);

  const handleEndDateChange = useCallback(({end: newDate}: DateChangeEvent) => {
    onEndDateChange(newDate);
    setEndDatePickerActive(false);
  }, [onEndDateChange]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <BlockStack gap="300">
      <Card roundedAbove="sm">
        <Box padding="400">
          <TextField
            label="Campaign Title"
            autoComplete="off"
            placeholder="Value"
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
                  type="text"
                  value="52"
                  suffix="px"
                  autoComplete="off"
                  disabled={size !== 'custom'}
                />
              </div>
              <div style={{width: '49%'}}>
                <TextField
                  label="Width"
                  type="text"
                  value="100"
                  suffix="%"
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
                          <Popover
                            active={startDatePickerActive}
                            autofocusTarget="none"
                            preferredAlignment="left"
                            fullWidth
                            preferInputActivator={false}
                            preferredPosition="below"
                            preventCloseOnChildOverlayClick
                            onClose={() => setStartDatePickerActive(false)}
                            activator={
                              <TextField
                                role="combobox"
                                label="Start date"
                                labelHidden
                                prefix={<Icon source="calendar"/>}
                                value={formatDate(startDate)}
                                onFocus={() => setStartDatePickerActive(true)}
                                autoComplete="off"
                                readOnly
                              />
                            }
                          >
                            <Box padding="400">
                              <DatePicker
                                month={startMonth}
                                year={startYear}
                                selected={startDate}
                                onMonthChange={handleStartMonthChange}
                                onChange={handleStartDateChange}
                              />
                            </Box>
                          </Popover>
                        </BlockStack>
                      </div>
                      <div style={{width: '49%'}}>
                        <BlockStack gap="300">
                          <Text as="p" variant="bodyMd">Time (GMT+06:00)</Text>
                          <TextField
                            label="Start time"
                            labelHidden
                            value={startTime}
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
                          <Popover
                            active={endDatePickerActive}
                            autofocusTarget="none"
                            preferredAlignment="left"
                            fullWidth
                            preferInputActivator={false}
                            preferredPosition="below"
                            preventCloseOnChildOverlayClick
                            onClose={() => setEndDatePickerActive(false)}
                            activator={
                              <TextField
                                role="combobox"
                                label="End date"
                                labelHidden
                                prefix={<Icon source="calendar"/>}
                                value={formatDate(endDate)}
                                onFocus={() => setEndDatePickerActive(true)}
                                autoComplete="off"
                                readOnly
                              />
                            }
                          >
                            <Box padding="400">
                              <DatePicker
                                month={endMonth}
                                year={endYear}
                                selected={endDate}
                                onMonthChange={handleEndMonthChange}
                                onChange={handleEndDateChange}
                              />
                            </Box>
                          </Popover>
                        </BlockStack>
                      </div>
                      <div style={{width: '49%'}}>
                        <BlockStack gap="300">
                          <Text as="p" variant="bodyMd">Time (GMT+06:00)</Text>
                          <TextField
                            label="End time"
                            labelHidden
                            value={endTime}
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
