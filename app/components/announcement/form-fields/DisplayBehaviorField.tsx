import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Select,
  Box,
} from "@shopify/polaris";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { z } from "zod";

const delayOptions = [
  { label: 'None', value: 'none' },
  { label: '5 minutes', value: '5' },
  { label: '10 minutes', value: '10' },
  { label: '15 minutes', value: '15' },
  { label: '20 minutes', value: '20' },
  { label: '25 minutes', value: '25' },
  { label: '30 minutes', value: '30' },
];

const showAgainOptions = [
  { label: 'Never', value: 'none' },
  { label: 'After 1 day', value: '1' },
  { label: 'After 3 days', value: '3' },
  { label: 'After 7 days', value: '7' },
  { label: 'After 15 days', value: '15' },
  { label: 'After 30 days', value: '30' },
];

// Define schema for display behavior
const displayBehaviorSchema = z.object({
  displayBeforeDelay: z.string().default('none'),
  showAfterClosing: z.string().default('none'),
  showAfterCTA: z.string().default('none'),
});

type DisplayBehaviorData = z.infer<typeof displayBehaviorSchema>;

interface DisplayBehaviorFieldProps {
  initialData?: Partial<DisplayBehaviorData>;
  onDataChange: (data: DisplayBehaviorData, isValid: boolean) => void;
  externalErrors?: Record<string, string>;
}

export function DisplayBehaviorField({
  initialData = {},
  onDataChange,
  externalErrors = {}
}: DisplayBehaviorFieldProps) {
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const hasCalledOnDataChange = useRef(false);
  
  const [formData, setFormData] = useState<DisplayBehaviorData>(() => {
    return {
      displayBeforeDelay: initialData.displayBeforeDelay || 'none',
      showAfterClosing: initialData.showAfterClosing || 'none',
      showAfterCTA: initialData.showAfterCTA || 'none',
    };
  });

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    // Skip updates if hasCalledOnDataChange is already true (component already initialized)
    if (hasCalledOnDataChange.current) {
      return;
    }
    
    // Only update if we have significant initial data
    if (initialData.displayBeforeDelay || initialData.showAfterClosing || initialData.showAfterCTA) {
      setFormData(prev => ({
        ...prev,
        displayBeforeDelay: initialData.displayBeforeDelay || prev.displayBeforeDelay,
        showAfterClosing: initialData.showAfterClosing || prev.showAfterClosing,
        showAfterCTA: initialData.showAfterCTA || prev.showAfterCTA,
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
      displayBehaviorSchema.parse(formData);
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

  const onDisplayBeforeDelayChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      displayBeforeDelay: value || 'none'
    }));
  }, []);

  const onShowAfterClosingChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      showAfterClosing: value || 'none'
    }));
  }, []);

  const onShowAfterCTAChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      showAfterCTA: value || 'none'
    }));
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
          <Text variant="headingMd" as="h6">Display Behavior</Text>
          <InlineStack gap="400" align="start">
            <div style={{flex: 1}}>
              <Select
                label="Display before showing bar"
                options={delayOptions}
                onChange={onDisplayBeforeDelayChange}
                value={formData.displayBeforeDelay}
                error={hasError('displayBeforeDelay')}
              />
              {hasError('displayBeforeDelay') && (
                <Text tone="critical" as="p">{getFieldErrorMessage('displayBeforeDelay')}</Text>
              )}
            </div>
            <div style={{flex: 1}}>
              <Select
                label="Show bar again after closing"
                options={showAgainOptions}
                onChange={onShowAfterClosingChange}
                value={formData.showAfterClosing}
                error={hasError('showAfterClosing')}
              />
              {hasError('showAfterClosing') && (
                <Text tone="critical" as="p">{getFieldErrorMessage('showAfterClosing')}</Text>
              )}
            </div>
            <div style={{flex: 1}}>
              <Select
                label="Show bar again after CTA clicked"
                options={delayOptions}
                onChange={onShowAfterCTAChange}
                value={formData.showAfterCTA}
                error={hasError('showAfterCTA')}
              />
              {hasError('showAfterCTA') && (
                <Text tone="critical" as="p">{getFieldErrorMessage('showAfterCTA')}</Text>
              )}
            </div>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
} 