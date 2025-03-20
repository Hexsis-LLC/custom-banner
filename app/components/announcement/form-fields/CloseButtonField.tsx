import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  RadioButton,
  Box,
} from "@shopify/polaris";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { z } from "zod";
import { ColorPickerInput } from "app/components/ColorPickerInput";

// Define schema for close button
const closeButtonSchema = z.object({
  showCloseButton: z.boolean().optional(),
  closeButtonPosition: z.enum(['none', 'left', 'right', 'center']),
  closeButtonColor: z.string().min(1, "Close button color is required")
});

type CloseButtonData = z.infer<typeof closeButtonSchema>;

interface CloseButtonFieldProps {
  initialData?: Partial<CloseButtonData>;
  onDataChange: (data: CloseButtonData, isValid: boolean) => void;
  externalErrors?: Record<string, string>;
}

export function CloseButtonField({
  initialData = {},
  onDataChange,
  externalErrors = {}
}: CloseButtonFieldProps) {
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const hasCalledOnDataChange = useRef(false);
  
  const [formData, setFormData] = useState<CloseButtonData>(() => {
    return {
      showCloseButton: initialData.showCloseButton !== undefined ? initialData.showCloseButton : true,
      closeButtonPosition: initialData.closeButtonPosition || 'right',
      closeButtonColor: initialData.closeButtonColor || 'rgb(255, 255, 255)',
    };
  });

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    // Skip updates if hasCalledOnDataChange is already true (component already initialized)
    if (hasCalledOnDataChange.current) {
      return;
    }
    
    // Only update if we have significant initial data
    if (initialData.closeButtonPosition) {
      setFormData(prev => ({
        ...prev,
        showCloseButton: initialData.showCloseButton !== undefined ? initialData.showCloseButton : prev.showCloseButton,
        closeButtonPosition: initialData.closeButtonPosition || prev.closeButtonPosition,
        closeButtonColor: initialData.closeButtonColor || prev.closeButtonColor,
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
      closeButtonSchema.parse(formData);
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

  const handleCloseButtonChange = useCallback((_checked: boolean, position: 'none' | 'left' | 'right') => {
    setFormData(prev => ({
      ...prev,
      showCloseButton: position !== 'none',
      closeButtonPosition: position
    }));
  }, []);

  const handleCloseButtonColorChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      closeButtonColor: value
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
          <Text variant="headingMd" as="h6">Close Button Settings</Text>
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              Show close button
            </Text>
            <InlineStack gap="400" align="start">
              <RadioButton
                label="Disabled"
                checked={!formData.showCloseButton || formData.closeButtonPosition === "none"}
                id="none"
                name="closeButton"
                onChange={(checked: boolean) => handleCloseButtonChange(checked, "none")}
              />
              <RadioButton
                label="Left"
                checked={formData.showCloseButton && formData.closeButtonPosition === "left"}
                id="left"
                name="closeButton"
                onChange={(checked: boolean) => handleCloseButtonChange(checked, "left")}
              />
              <RadioButton
                label="Right"
                checked={formData.showCloseButton && formData.closeButtonPosition === "right"}
                id="right"
                name="closeButton"
                onChange={(checked: boolean) => handleCloseButtonChange(checked, "right")}
              />
            </InlineStack>
          </BlockStack>

          {formData.showCloseButton && formData.closeButtonPosition !== "none" && (
            <BlockStack gap="200">
              <ColorPickerInput
                label="Close Button Color"
                value={formData.closeButtonColor ?? "rgb(255, 255, 255)"}
                onChange={handleCloseButtonColorChange}
                type="solid"
                error={hasError('closeButtonColor') ? getFieldErrorMessage('closeButtonColor') : undefined}
              />
              {hasError('closeButtonColor') && (
                <Text tone="critical" as="p">{getFieldErrorMessage('closeButtonColor')}</Text>
              )}
            </BlockStack>
          )}
        </BlockStack>
      </Box>
    </Card>
  );
}
