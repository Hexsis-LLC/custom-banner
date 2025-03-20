import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  RadioButton,
  Select,
  Box,
  Icon,
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

export function CountdownField({
  initialData = {},
  onDataChange,
  externalErrors = {}
}: CountdownFieldProps) {
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const hasCalledOnDataChange = useRef(false);
  
  // State for UI
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedEndTime, setSelectedEndTime] = useState('12:30 PM');
  
  const [formData, setFormData] = useState<CountdownFieldData>(() => {
    // Initialize with defaults merged with any provided initial data
    return {
      timerType: initialData.timerType || 'till_end_date',
      timeFormat: initialData.timeFormat || 'HH:mm:ss',
      showDays: initialData.showDays !== undefined ? initialData.showDays : true,
      endDateTime: initialData.endDateTime || DEFAULT_END_DATE.toISOString(),
      durationDays: initialData.durationDays || 0,
      durationHours: initialData.durationHours || 0,
      durationMinutes: initialData.durationMinutes || 0,
      durationSeconds: initialData.durationSeconds || 0,
      dailyStartTime: initialData.dailyStartTime || '09:00 AM',
      dailyEndTime: initialData.dailyEndTime || '05:00 PM',
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
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof CountdownFieldData;
      // @ts-ignore - We know these keys exist in both objects
      if (JSON.stringify(updates[typedKey]) !== JSON.stringify(formData[typedKey])) {
        hasChanged = true;
      }
    });
    
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
   * Validates the form data without setting errors (for internal use)
   */
  const validateData = useCallback((dataToValidate: CountdownFieldData): boolean => {
    try {
      countdownFieldSchema.parse(dataToValidate);
      return true;
    } catch (error) {
      return false;
    }
  }, []);

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
    
    // Prevent recursive updates by ensuring we don't notify parent with the same data
    if (hasCalledOnDataChange.current) {
      onDataChange(formData, isValid);
    } else {
      hasCalledOnDataChange.current = true;
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

  const handleShowDaysChange = useCallback((value: boolean) => {
    updateFormState({ showDays: value });
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

  const handleDurationChange = useCallback((value: number, field: 'durationDays' | 'durationHours' | 'durationMinutes' | 'durationSeconds') => {
    updateFormState({ [field]: value });
  }, [updateFormState]);

  const handleDailyStartTimeChange = useCallback((time: string) => {
    updateFormState({ dailyStartTime: time });
  }, [updateFormState]);

  const handleDailyEndTimeChange = useCallback((time: string) => {
    updateFormState({ dailyEndTime: time });
  }, [updateFormState]);

  const handleAfterTimerEndsChange = useCallback((value: string) => {
    updateFormState({ 
      afterTimerEnds: {
        ...formData.afterTimerEnds,
        action: value as 'hide' | 'show_zeros' | 'create_announcement'
      }
    });
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

  const afterTimerEndsOptions = [
    { value: 'hide', label: 'Hide banner after limit exited' },
    { value: 'show_zeros', label: 'Display 00:00:00 on the banner' },
    { value: 'create_announcement', label: 'Create another announcement' }
  ];

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
                <BlockStack gap="300">
                  <InlineStack gap="400" align="start">
                    <div style={{ flex: 1 }}>
                      <Text as="p" variant="bodyMd">Days</Text>
                      <Select
                        label="Days"
                        labelHidden
                        options={Array.from({ length: 31 }, (_, i) => ({ 
                          label: i.toString(), 
                          value: i.toString() 
                        }))}
                        value={formData.durationDays?.toString() || "0"}
                        onChange={(value) => handleDurationChange(Number(value), 'durationDays')}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text as="p" variant="bodyMd">Hours</Text>
                      <Select
                        label="Hours"
                        labelHidden
                        options={Array.from({ length: 24 }, (_, i) => ({ 
                          label: i.toString(), 
                          value: i.toString() 
                        }))}
                        value={formData.durationHours?.toString() || "0"}
                        onChange={(value) => handleDurationChange(Number(value), 'durationHours')}
                      />
                    </div>
                  </InlineStack>
                  <InlineStack gap="400" align="start">
                    <div style={{ flex: 1 }}>
                      <Text as="p" variant="bodyMd">Minutes</Text>
                      <Select
                        label="Minutes"
                        labelHidden
                        options={Array.from({ length: 60 }, (_, i) => ({ 
                          label: i.toString(), 
                          value: i.toString() 
                        }))}
                        value={formData.durationMinutes?.toString() || "0"}
                        onChange={(value) => handleDurationChange(Number(value), 'durationMinutes')}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text as="p" variant="bodyMd">Seconds</Text>
                      <Select
                        label="Seconds"
                        labelHidden
                        options={Array.from({ length: 60 }, (_, i) => ({ 
                          label: i.toString(), 
                          value: i.toString() 
                        }))}
                        value={formData.durationSeconds?.toString() || "0"}
                        onChange={(value) => handleDurationChange(Number(value), 'durationSeconds')}
                      />
                    </div>
                  </InlineStack>
                  {hasError('durationDays') && (
                    <Text tone="critical" as="span">{getFieldErrorMessage('durationDays')}</Text>
                  )}
                </BlockStack>
              )}

              {formData.timerType === 'daily_schedule' && (
                <InlineStack gap="400" align="start">
                  <div style={{ flex: 1 }}>
                    <TimePickerPopover
                      label="Start Time"
                      selectedTime={formData.dailyStartTime || '09:00 AM'}
                      onChange={handleDailyStartTimeChange}
                    />
                    {hasError('dailyStartTime') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('dailyStartTime')}</Text>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <TimePickerPopover
                      label="End Time"
                      selectedTime={formData.dailyEndTime || '05:00 PM'}
                      onChange={handleDailyEndTimeChange}
                    />
                    {hasError('dailyEndTime') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('dailyEndTime')}</Text>
                    )}
                  </div>
                </InlineStack>
              )}

              <InlineStack gap="400" align="start">
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