import {
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  Select,
  Box,
} from "@shopify/polaris";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { z } from "zod";
import { DatePickerPopover } from "../../DatePickerPopover";
import { TimePickerPopover } from "../../TimePickerPopover";

// Define schema for schedule campaign
const scheduleCampaignSchema = z.object({
  startType: z.enum(['now', 'specific']),
  endType: z.enum(['until_stop', 'specific']),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional()
});

type ScheduleCampaignData = z.infer<typeof scheduleCampaignSchema>;
type StartType = 'now' | 'specific';
type EndType = 'until_stop' | 'specific';

interface ScheduleCampaignFieldProps {
  initialData?: Partial<ScheduleCampaignData>;
  onDataChange: (data: ScheduleCampaignData, isValid: boolean) => void;
  externalErrors?: Record<string, string>;
}

export function ScheduleCampaignField({
  initialData = {},
  onDataChange,
  externalErrors = {}
}: ScheduleCampaignFieldProps) {
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const hasCalledOnDataChange = useRef(false);
  
  const [formData, setFormData] = useState<ScheduleCampaignData>(() => {
    const now = new Date();
    return {
      startType: initialData.startType || 'now',
      endType: initialData.endType || 'until_stop',
      startDate: initialData.startDate || now.toISOString(),
      endDate: initialData.endDate || now.toISOString(),
      startTime: initialData.startTime || '',
      endTime: initialData.endTime || '',
    };
  });

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    // Skip updates if hasCalledOnDataChange is already true (component already initialized)
    if (hasCalledOnDataChange.current) {
      return;
    }
    
    // Only update if we have significant initial data
    if (initialData.startType || initialData.endType) {
      setFormData(prev => ({
        ...prev,
        startType: initialData.startType || prev.startType,
        endType: initialData.endType || prev.endType,
        startDate: initialData.startDate || prev.startDate,
        endDate: initialData.endDate || prev.endDate,
        startTime: initialData.startTime || prev.startTime,
        endTime: initialData.endTime || prev.endTime,
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
   * Validates the form data and sets error messages
   */
  const validateForm = useCallback(() => {
    try {
      scheduleCampaignSchema.parse(formData);
      setLocalErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
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

  const onStartTypeChange = useCallback((value: StartType) => {
    const updates: Partial<ScheduleCampaignData> = { startType: value };
    
    if (value === 'now') {
      updates.startDate = new Date().toISOString();
      updates.startTime = '';
    } else if (value === 'specific' && formData.startTime === '') {
      const now = new Date();
      now.setHours(12, 0, 0, 0);
      updates.startDate = now.toISOString();
      updates.startTime = '12:00 PM';
    }
    
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, [formData.startTime]);

  const onEndTypeChange = useCallback((value: EndType) => {
    const updates: Partial<ScheduleCampaignData> = { endType: value };
    
    if (value === 'until_stop') {
      updates.endDate = new Date().toISOString();
      updates.endTime = '';
    } else if (value === 'specific' && formData.endTime === '') {
      const now = new Date();
      now.setHours(12, 0, 0, 0);
      updates.endDate = now.toISOString();
      updates.endTime = '12:00 PM';
    }
    
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, [formData.endTime]);

  const onStartDateChange = useCallback((date: Date) => {
    setFormData(prev => ({
      ...prev,
      startDate: date.toISOString()
    }));
  }, []);

  const onEndDateChange = useCallback((date: Date) => {
    setFormData(prev => ({
      ...prev,
      endDate: date.toISOString()
    }));
  }, []);

  const onStartTimeChange = useCallback((value: string) => {
    // Update the existing startDate with the new time
    if (formData.startDate) {
      const date = new Date(formData.startDate);
      
      // Parse the selected time and set it on the date
      const timeParts = value.match(/(\d+):(\d+)\s?(AM|PM)/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const isPM = timeParts[3].toUpperCase() === 'PM';
        
        // Convert to 24-hour format
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        
        date.setHours(hours, minutes, 0, 0);
        
        setFormData(prev => ({
          ...prev,
          startDate: date.toISOString(),
          startTime: value
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          startTime: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        startTime: value
      }));
    }
  }, [formData.startDate]);

  const onEndTimeChange = useCallback((value: string) => {
    // Update the existing endDate with the new time
    if (formData.endDate) {
      const date = new Date(formData.endDate);
      
      // Parse the selected time and set it on the date
      const timeParts = value.match(/(\d+):(\d+)\s?(AM|PM)/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const isPM = timeParts[3].toUpperCase() === 'PM';
        
        // Convert to 24-hour format
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        
        date.setHours(hours, minutes, 0, 0);
        
        setFormData(prev => ({
          ...prev,
          endDate: date.toISOString(),
          endTime: value
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          endTime: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        endTime: value
      }));
    }
  }, [formData.endDate]);

  const getDateFromString = useCallback((dateString: string | Date | undefined): Date => {
    try {
      return dateString ? new Date(dateString) : new Date();
    } catch (error) {
      return new Date();
    }
  }, []);

  const hasError = useCallback((path: string) => {
    return !!errors[path];
  }, [errors]);

  const getFieldErrorMessage = useCallback((path: string) => {
    return errors[path] || '';
  }, [errors]);

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack gap="200">
            <Text variant="headingMd" as="h6">Schedule Campaign</Text>
            <Icon source="help" />
          </InlineStack>

          <BlockStack gap="300">
            <Text variant="bodyMd" fontWeight="medium" as="p">Start</Text>
            <Select
              label="Start type"
              labelHidden
              options={[
                {label: 'Start now', value: 'now'},
                {label: 'Schedule start', value: 'specific'}
              ]}
              value={formData.startType}
              onChange={onStartTypeChange}
              error={hasError('startType')}
            />

            {formData.startType === 'specific' && (
              <InlineStack gap="400">
                <div style={{flex: 1}}>
                  <DatePickerPopover
                    label="Start Date"
                    selectedDate={getDateFromString(formData.startDate)}
                    onChange={onStartDateChange}
                  />
                  {hasError('startDate') && (
                    <Text variant="bodyMd" tone="critical" as="p">{getFieldErrorMessage('startDate')}</Text>
                  )}
                </div>
                <div style={{flex: 1}}>
                  <TimePickerPopover
                    label="Start Time"
                    selectedTime={formData.startTime || '12:00 PM'}
                    onChange={onStartTimeChange}
                  />
                  {hasError('startTime') && (
                    <Text variant="bodyMd" tone="critical" as="p">{getFieldErrorMessage('startTime')}</Text>
                  )}
                </div>
              </InlineStack>
            )}
          </BlockStack>

          <BlockStack gap="300">
            <Text variant="bodyMd" fontWeight="medium" as="p">End</Text>
            <Select
              label="End type"
              labelHidden
              options={[
                {label: 'Until I stop it', value: 'until_stop'},
                {label: 'Schedule end', value: 'specific'}
              ]}
              value={formData.endType}
              onChange={onEndTypeChange}
              error={hasError('endType')}
            />

            {formData.endType === 'specific' && (
              <InlineStack gap="400">
                <div style={{flex: 1}}>
                  <DatePickerPopover
                    label="End Date"
                    selectedDate={getDateFromString(formData.endDate)}
                    onChange={onEndDateChange}
                  />
                  {hasError('endDate') && (
                    <Text variant="bodyMd" tone="critical" as="p">{getFieldErrorMessage('endDate')}</Text>
                  )}
                </div>
                <div style={{flex: 1}}>
                  <TimePickerPopover
                    label="End Time"
                    selectedTime={formData.endTime || '12:00 PM'}
                    onChange={onEndTimeChange}
                  />
                  {hasError('endTime') && (
                    <Text variant="bodyMd" tone="critical" as="p">{getFieldErrorMessage('endTime')}</Text>
                  )}
                </div>
              </InlineStack>
            )}
          </BlockStack>
        </BlockStack>
      </Box>
    </Card>
  );
}
