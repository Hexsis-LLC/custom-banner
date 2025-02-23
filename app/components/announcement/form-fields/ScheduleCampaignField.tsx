import {
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  Select,
  Box,
} from "@shopify/polaris";
import { useFormContext } from "../../../contexts/AnnouncementFormContext";
import { DatePickerPopover } from "../../DatePickerPopover";
import { TimePickerPopover } from "../../TimePickerPopover";

type StartType = 'now' | 'specific';
type EndType = 'until_stop' | 'specific';

export function ScheduleCampaignField() {
  const { formData, handleFormChange, hasError, getFieldErrorMessage } = useFormContext();

  const onStartTypeChange = (value: StartType) => {
    if (value === 'now') {
      handleFormChange('basic', { 
        startType: value,
        startDate: new Date().toISOString(),
        startTime: '',
      });
    } else {
      const now = new Date();
      now.setHours(12, 0, 0, 0);
      handleFormChange('basic', { 
        startType: value,
        startDate: now.toISOString(),
        startTime: '12:00'
      });
    }
  };

  const onEndTypeChange = (value: EndType) => {
    if (value === 'until_stop') {
      handleFormChange('basic', { 
        endType: value,
        endDate: new Date().toISOString(),
        endTime: '',
      });
    } else {
      const now = new Date();
      now.setHours(12, 0, 0, 0);
      handleFormChange('basic', { 
        endType: value,
        endDate: now.toISOString(),
        endTime: '12:00'
      });
    }
  };

  const onStartDateChange = (date: Date) => {
    // Set time to noon to avoid timezone issues
    const selectedDate = new Date(date);
    selectedDate.setHours(12, 0, 0, 0);
    handleFormChange('basic', { 
      startDate: selectedDate.toISOString(),
      startType: 'specific' as const
    });
  };

  const onEndDateChange = (date: Date) => {
    // Set time to noon to avoid timezone issues
    const selectedDate = new Date(date);
    selectedDate.setHours(12, 0, 0, 0);
    handleFormChange('basic', { 
      endDate: selectedDate.toISOString(),
      endType: 'specific' as const
    });
  };

  const onStartTimeChange = (value: string) => {
    // Convert time to 24-hour format for consistency
    const [time, period] = value.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }

    const formattedTime = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    handleFormChange('basic', { 
      startTime: value,
      startType: 'specific' as const
    });
  };

  const onEndTimeChange = (value: string) => {
    // Convert time to 24-hour format for consistency
    const [time, period] = value.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }

    const formattedTime = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    handleFormChange('basic', { 
      endTime: value,
      endType: 'specific' as const
    });
  };

  const getDateFromString = (dateString: string | Date | undefined): Date => {
    if (!dateString) {
      const now = new Date();
      now.setHours(12, 0, 0, 0);
      return now;
    }
    if (typeof dateString === 'string') {
      const date = new Date(dateString);
      date.setHours(12, 0, 0, 0);
      return date;
    }
    const date = new Date(dateString);
    date.setHours(12, 0, 0, 0);
    return date;
  };

  return (
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
                    value={formData.basic.startType || 'now'}
                    onChange={(value) => onStartTypeChange(value as StartType)}
                  />
                  {formData.basic.startType === 'specific' ? (
                    <InlineStack align={"space-between"}>
                      <div style={{width: '49%'}}>
                        <BlockStack gap="300">
                          <Text as="p" variant="bodyMd">Date</Text>
                          <DatePickerPopover
                            selectedDate={formData.basic.startDate ? getDateFromString(formData.basic.startDate) : new Date()}
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
                          <Text as="p" variant="bodyMd">Time</Text>
                          <TimePickerPopover
                            selectedTime={formData.basic.startTime || ''}
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
                  ) : (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Campaign will start immediately after publishing
                    </Text>
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
                    value={formData.basic.endType || 'until_stop'}
                    onChange={(value) => onEndTypeChange(value as EndType)}
                  />
                  {formData.basic.endType === 'specific' ? (
                    <InlineStack align={"space-between"}>
                      <div style={{width: '49%'}}>
                        <BlockStack gap="300">
                          <Text as="p" variant="bodyMd">Date</Text>
                          <DatePickerPopover
                            selectedDate={formData.basic.endDate ? getDateFromString(formData.basic.endDate) : new Date()}
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
                          <Text as="p" variant="bodyMd">Time</Text>
                          <TimePickerPopover
                            selectedTime={formData.basic.endTime || ''}
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
                  ) : (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Campaign will run until manually stopped
                    </Text>
                  )}
                </BlockStack>
              </div>
            </InlineStack>
          </BlockStack>
        </BlockStack>
      </Box>
    </Card>
  );
}
