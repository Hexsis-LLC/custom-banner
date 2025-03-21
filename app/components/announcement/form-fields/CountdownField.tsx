import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  RadioButton,
  Select,
  Box,
  Icon,
  TextField,
  RangeSlider,
} from "@shopify/polaris";
import { InfoIcon, ChevronUpIcon, ChevronDownIcon } from '@shopify/polaris-icons';
import { countdownFieldSchema, CountdownFieldData } from "../../../schemas/schemas/CountdownFieldSchema";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { ZodError } from "zod";
import { DatePickerPopover } from "../../DatePickerPopover";
import { TimePickerPopover } from "../../TimePickerPopover";

interface CountdownFieldProps {
  initialData?: Partial<CountdownFieldData>;
  onDataChange: (data: CountdownFieldData, isValid: boolean) => void;
  externalErrors?: Record<string, string>;
}

const DEFAULT_END_DATE = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

// Helper function to format hours to display format (0:00 - 23:00)
const formatHourRange = (hours: [number, number]): [string, string] => {
  return [
    `${hours[0]}:00`,
    `${hours[1]}:00`
  ];
};

// Helper function to convert string time range back to hours
const parseTimeRange = (startTime: string, endTime: string): [number, number] => {
  const startHour = parseInt(startTime.split(':')[0], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);
  return [startHour, endHour];
};

export function CountdownField({
  initialData = {},
  onDataChange,
  externalErrors = {}
}: CountdownFieldProps) {
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const hasCalledOnDataChange = useRef(false);
  // Track previous form data for change detection
  const previousDataRef = useRef('');

  // State for UI
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedEndTime, setSelectedEndTime] = useState('12:30 PM');

  // State for time range slider
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 23]);

  const [formData, setFormData] = useState<CountdownFieldData>(() => {
    // Initialize with defaults merged with any provided initial data
    let initialTimeRange: [number, number] = [0, 23];
    if (initialData.dailyStartTime && initialData.dailyEndTime) {
      initialTimeRange = parseTimeRange(initialData.dailyStartTime, initialData.dailyEndTime);
      setTimeRange(initialTimeRange);
    }

    return {
      timerType: initialData.timerType || 'till_end_date',
      timeFormat: initialData.timeFormat || 'HH:mm:ss',
      showDays: initialData.showDays !== undefined ? initialData.showDays : true,
      endDateTime: initialData.endDateTime || DEFAULT_END_DATE.toISOString(),
      durationDays: initialData.durationDays || 0,
      durationHours: initialData.durationHours || 0,
      durationMinutes: initialData.durationMinutes || 0,
      durationSeconds: initialData.durationSeconds || 0,
      dailyStartTime: initialData.dailyStartTime || '0:00',
      dailyEndTime: initialData.dailyEndTime || '23:00',
      afterTimerEnds: initialData.afterTimerEnds || {
        action: 'hide'
      }
    };
  });

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    // Skip updates if hasCalledOnDataChange is already true (component already initialized)
    if (hasCalledOnDataChange.current) {
      return;
    }

    // Only update if we have significant initial data
    if (initialData.timerType) {
      if (initialData.dailyStartTime && initialData.dailyEndTime) {
        const initialTimeRange = parseTimeRange(initialData.dailyStartTime, initialData.dailyEndTime);
        setTimeRange(initialTimeRange);
      }

      setFormData(prev => ({
        ...prev,
        timerType: initialData.timerType || prev.timerType,
        timeFormat: initialData.timeFormat || prev.timeFormat,
        showDays: initialData.showDays !== undefined ? initialData.showDays : prev.showDays,
        endDateTime: initialData.endDateTime || prev.endDateTime,
        durationDays: initialData.durationDays !== undefined ? initialData.durationDays : prev.durationDays,
        durationHours: initialData.durationHours !== undefined ? initialData.durationHours : prev.durationHours,
        durationMinutes: initialData.durationMinutes !== undefined ? initialData.durationMinutes : prev.durationMinutes,
        durationSeconds: initialData.durationSeconds !== undefined ? initialData.durationSeconds : prev.durationSeconds,
        dailyStartTime: initialData.dailyStartTime || prev.dailyStartTime,
        dailyEndTime: initialData.dailyEndTime || prev.dailyEndTime,
        afterTimerEnds: initialData.afterTimerEnds || prev.afterTimerEnds
      }));
    }
  }, [initialData]);

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Combine external and local errors
  const errors = useMemo(() => ({
    ...localErrors,
    ...externalErrors
  }), [localErrors, externalErrors]);

  /**
   * Updates the form data without notifying parent
   */
  const updateFormState = useCallback((updates: Partial<CountdownFieldData>) => {
    // Check if we're actually changing something
    let hasChanged = false;

    try {
      Object.keys(updates).forEach(key => {
        const typedKey = key as keyof CountdownFieldData;
        // For afterTimerEnds, do a deep comparison
        if (typedKey === 'afterTimerEnds' && updates.afterTimerEnds) {
          const currentAction = formData.afterTimerEnds?.action;
          const newAction = updates.afterTimerEnds.action;

          // If action is changing, this is an important change
          if (currentAction !== newAction) {
            hasChanged = true;
          } else {
            // Otherwise do a deeper comparison with stringification
            const currentString = JSON.stringify(formData.afterTimerEnds);
            const newString = JSON.stringify(updates.afterTimerEnds);
            if (currentString !== newString) {
              hasChanged = true;
            }
          }
        }
        // For other fields, do a simple comparison
        else if (JSON.stringify(updates[typedKey]) !== JSON.stringify(formData[typedKey])) {
          hasChanged = true;
        }
      });
    } catch (e) {
      // If comparison fails for any reason, assume we need to update
      hasChanged = true;
      console.error("Error during form state comparison:", e);
    }

    // Only update if something changed
    if (hasChanged) {
      setFormData(prevFormData => {
        return {
          ...prevFormData,
          ...updates
        } as CountdownFieldData;
      });
    }
  }, [formData]);



  /**
   * Validates the form data and sets error messages
   */
  const validateForm = useCallback(() => {
    try {
      countdownFieldSchema.parse(formData);
      setLocalErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};

        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });

        setLocalErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  // Run validation when external errors change
  useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalErrors]);

  // Validate and notify parent when form data changes
  useEffect(() => {
    // Skip the first render
    if (isInitialMount.current) {
      isInitialMount.current = false;

      // Immediately validate on mount but don't call onDataChange
      validateForm();
      hasCalledOnDataChange.current = true;
      return;
    }

    // For subsequent updates, validate and notify parent
    const isValid = validateForm();

    // Create a stringified version of the data to compare changes
    const currentDataString = JSON.stringify(formData);

    // Only notify parent if there was an actual change
    if (previousDataRef.current !== currentDataString) {
      onDataChange(formData, isValid);
      previousDataRef.current = currentDataString;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  /**
   * Checks if a field has an error
   */
  const hasError = useCallback((path: string) => {
    return !!errors[path];
  }, [errors]);

  /**
   * Gets error message for a field
   */
  const getFieldErrorMessage = useCallback((path: string) => {
    return errors[path] || '';
  }, [errors]);

  // Event handlers
  const handleTimerTypeChange = useCallback((value: string) => {
    updateFormState({
      timerType: value as 'till_end_date' | 'duration' | 'daily_schedule'
    });
  }, [updateFormState]);

  const handleTimeFormatChange = useCallback((value: string) => {
    updateFormState({ timeFormat: value });
  }, [updateFormState]);

  const handleEndDateChange = useCallback((date: Date) => {
    // When setting a new date, we need to incorporate the time component that the user previously selected
    const endDateTime = new Date(date);

    // Parse the selected time and set it on the date
    const timeParts = selectedEndTime.match(/(\d+):(\d+)\s?(AM|PM)/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1], 10);
      const minutes = parseInt(timeParts[2], 10);
      const isPM = timeParts[3].toUpperCase() === 'PM';

      // Convert to 24-hour format
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;

      endDateTime.setHours(hours, minutes, 0, 0);
    }

    updateFormState({ endDateTime: endDateTime.toISOString() });
  }, [updateFormState, selectedEndTime]);

  const handleEndTimeChange = useCallback((time: string) => {
    setSelectedEndTime(time);

    // Update the existing endDateTime with the new time
    if (formData.endDateTime) {
      const date = new Date(formData.endDateTime);

      // Parse the selected time and set it on the date
      const timeParts = time.match(/(\d+):(\d+)\s?(AM|PM)/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const isPM = timeParts[3].toUpperCase() === 'PM';

        // Convert to 24-hour format
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        date.setHours(hours, minutes, 0, 0);
        updateFormState({ endDateTime: date.toISOString() });
      }
    }
  }, [formData.endDateTime, updateFormState]);

  // Helper to determine which fields to show based on selected time format
  const visibleTimeFields = useMemo(() => {
    switch (formData.timeFormat) {
      case 'DD:HH:mm:ss':
        return { days: true, hours: true, minutes: true, seconds: true };
      case 'HH:mm:ss':
        return { days: false, hours: true, minutes: true, seconds: true };
      case 'mm:ss':
        return { days: false, hours: false, minutes: true, seconds: true };
      case 'ss':
        return { days: false, hours: false, minutes: false, seconds: true };
      default:
        return { days: true, hours: true, minutes: true, seconds: true };
    }
  }, [formData.timeFormat]);

  // Event handlers for text input fields
  const handleDurationTextChange = useCallback((value: string, field: 'durationDays' | 'durationHours' | 'durationMinutes' | 'durationSeconds') => {
    // Ensure input is a valid number
    const numValue = value === '' ? 0 : parseInt(value.replace(/\D/g, ''), 10);

    // Apply proper limits based on the field
    let limitedValue = numValue;
    if (field === 'durationHours' && numValue > 23) limitedValue = 23;
    if ((field === 'durationMinutes' || field === 'durationSeconds') && numValue > 59) limitedValue = 59;

    updateFormState({ [field]: limitedValue });
  }, [updateFormState]);

  // Handle time range slider change
  const handleTimeRangeChange = useCallback((value: [number, number]) => {
    setTimeRange(value);
    const [formattedStart, formattedEnd] = formatHourRange(value);
    updateFormState({
      dailyStartTime: formattedStart,
      dailyEndTime: formattedEnd
    });
  }, [updateFormState]);

  const handleAfterTimerEndsChange = useCallback((value: string) => {
    // Prepare the new afterTimerEnds object based on the value
    const newAfterTimerEnds = {
      ...formData.afterTimerEnds,
      action: value as 'hide' | 'show_zeros' | 'create_announcement',
    };

    // Always add default fields when creating an announcement
    if (value === 'create_announcement') {
      Object.assign(newAfterTimerEnds, {
        message: formData.afterTimerEnds?.message || '',
        textColor: formData.afterTimerEnds?.textColor || '#FFFFFF',
        fontSize: formData.afterTimerEnds?.fontSize || 20,
        ctaType: formData.afterTimerEnds?.ctaType || 'none',
        ctaText: formData.afterTimerEnds?.ctaText || '',
        ctaLink: formData.afterTimerEnds?.ctaLink || '',
        buttonBackground: formData.afterTimerEnds?.buttonBackground || '#000000',
        buttonTextColor: formData.afterTimerEnds?.buttonTextColor || '#FFFFFF',
        fontType: formData.afterTimerEnds?.fontType || 'site'
      });
    }

    // Only update if there's an actual change
    const currentActionString = JSON.stringify(formData.afterTimerEnds);
    const newActionString = JSON.stringify(newAfterTimerEnds);

    if (currentActionString !== newActionString) {
      updateFormState({
        afterTimerEnds: newAfterTimerEnds
      });
    }
  }, [formData.afterTimerEnds, updateFormState]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const timeFormatOptions = [
    { value: 'DD:HH:mm:ss', label: 'Days, Hours, Minutes, Seconds' },
    { value: 'HH:mm:ss', label: 'Hours, Minutes, Seconds' },
    { value: 'mm:ss', label: 'Minutes, Seconds' },
    { value: 'ss', label: 'Seconds' }
  ];

  // Generate afterTimerEndsOptions based on the current timerType
  const afterTimerEndsOptions = useMemo(() => {
    // Base options that are always available
    const options = [
      { value: 'hide', label: 'Hide banner after limit exited' },
      { value: 'show_zeros', label: 'Display 00:00:00 on the banner' },
    ];

    // Only add "Create another announcement" option for non-duration timer types
    if (formData.timerType !== 'duration') {
      options.push({ value: 'create_announcement', label: 'Create another announcement' });
    }

    return options;
  }, [formData.timerType]);


  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <div
            onClick={toggleExpanded}
            style={{ cursor: 'pointer', width: '100%' }}
            aria-expanded={isExpanded}
            role="button"
            tabIndex={0}
          >
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="100">
                <Text as="h2" variant="headingMd">Count Down</Text>
                <Icon source={InfoIcon} />
              </InlineStack>
              <Icon source={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
            </InlineStack>
          </div>

          {isExpanded && (
            <BlockStack gap="400">
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd" fontWeight="medium">Type</Text>
                <InlineStack gap="300" wrap={false} blockAlign="center">
                  <RadioButton
                    label="Till end date"
                    checked={formData.timerType === 'till_end_date'}
                    id="timer-type-fixed"
                    name="timer-type"
                    onChange={() => handleTimerTypeChange('till_end_date')}
                  />
                  <RadioButton
                    label="Duration"
                    checked={formData.timerType === 'duration'}
                    id="timer-type-duration"
                    name="timer-type"
                    onChange={() => handleTimerTypeChange('duration')}
                  />
                  <RadioButton
                    label="Every day on specific hour"
                    checked={formData.timerType === 'daily_schedule'}
                    id="timer-type-daily"
                    name="timer-type"
                    onChange={() => handleTimerTypeChange('daily_schedule')}
                  />
                </InlineStack>
                {hasError('timerType') && (
                  <Text tone="critical" as="span">{getFieldErrorMessage('timerType')}</Text>
                )}
              </BlockStack>

              {formData.timerType === 'till_end_date' && (
                <InlineStack gap="400" align="start">
                  <div style={{ flex: 1 }}>
                    <DatePickerPopover
                      label="End Date"
                      selectedDate={new Date(formData.endDateTime || DEFAULT_END_DATE.toISOString())}
                      onChange={handleEndDateChange}
                    />
                    {hasError('endDateTime') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('endDateTime')}</Text>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <TimePickerPopover
                      label="End Time"
                      selectedTime={selectedEndTime}
                      onChange={handleEndTimeChange}
                    />
                  </div>
                </InlineStack>
              )}

              {formData.timerType === 'duration' && (
                <BlockStack gap="400">
                  <InlineStack gap="400" align="start">
                    {visibleTimeFields.days && (
                      <div style={{ flex: 1 }}>
                        <TextField
                          label="Days"
                          value={formData.durationDays?.toString() || "0"}
                          onChange={(value) => handleDurationTextChange(value, 'durationDays')}
                          autoComplete="off"
                          type="text"
                          inputMode="numeric"
                        />
                      </div>
                    )}

                    {visibleTimeFields.hours && (
                      <div style={{ flex: 1 }}>
                        <TextField
                          label="Hours"
                          value={formData.durationHours?.toString() || "0"}
                          onChange={(value) => handleDurationTextChange(value, 'durationHours')}
                          autoComplete="off"
                          type="text"
                          inputMode="numeric"
                        />
                      </div>
                    )}

                    {visibleTimeFields.minutes && (
                      <div style={{ flex: 1 }}>
                        <TextField
                          label="Minutes"
                          value={formData.durationMinutes?.toString() || "0"}
                          onChange={(value) => handleDurationTextChange(value, 'durationMinutes')}
                          autoComplete="off"
                          type="text"
                          inputMode="numeric"
                        />
                      </div>
                    )}

                    {visibleTimeFields.seconds && (
                      <div style={{ flex: 1 }}>
                        <TextField
                          label="Seconds"
                          value={formData.durationSeconds?.toString() || "0"}
                          onChange={(value) => handleDurationTextChange(value, 'durationSeconds')}
                          autoComplete="off"
                          type="text"
                          inputMode="numeric"
                        />
                      </div>
                    )}
                  </InlineStack>

                  {hasError('durationDays') && (
                    <Text tone="critical" as="span">{getFieldErrorMessage('durationDays')}</Text>
                  )}
                </BlockStack>
              )}

              {formData.timerType === 'daily_schedule' && (
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">Banner show timer range</Text>
                    <RangeSlider
                      output
                      min={0}
                      max={23}
                      value={timeRange}
                      prefix={`${timeRange[0]}:00`}
                      suffix={`${timeRange[1]}:00`}
                      onChange={handleTimeRangeChange}
                      label=""
                      labelHidden
                    />
                    {(hasError('dailyStartTime') || hasError('dailyEndTime')) && (
                      <Text tone="critical" as="span">
                        {getFieldErrorMessage('dailyStartTime') || getFieldErrorMessage('dailyEndTime')}
                      </Text>
                    )}
                  </BlockStack>
                </BlockStack>
              )}

              <InlineStack gap="400" align="start">
                {formData.timerType !== 'daily_schedule' && (
                  <div style={{ flex: 1 }}>
                    <Select
                      label="After the timer ends"
                      options={afterTimerEndsOptions}
                      value={formData.afterTimerEnds?.action || 'hide'}
                      onChange={handleAfterTimerEndsChange}
                    />
                    {hasError('afterTimerEnds.action') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('afterTimerEnds.action')}</Text>
                    )}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <Select
                    label="Time format"
                    options={timeFormatOptions}
                    value={formData.timeFormat}
                    onChange={handleTimeFormatChange}
                  />
                  {hasError('timeFormat') && (
                    <Text tone="critical" as="span">{getFieldErrorMessage('timeFormat')}</Text>
                  )}
                </div>
              </InlineStack>
            </BlockStack>
          )}
        </BlockStack>
      </Box>
    </Card>
  );
}
