import {BlockStack, Box, Card, Icon, InlineStack, RadioButton, RangeSlider, Select, Text,} from "@shopify/polaris";
import {ColorPickerInput} from "app/components/ColorPickerInput";
import type {BackgroundFieldData} from "../../../schemas/schemas/BackgroundFieldSchema";
import { backgroundFieldSchema} from "../../../schemas/schemas/BackgroundFieldSchema";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ZodError} from "zod";

interface BackgroundFieldProps {
  initialData?: Partial<BackgroundFieldData>;
  onDataChange: (data: BackgroundFieldData, isValid: boolean) => void;
  externalErrors?: Record<string, string>;
}

const patternOptions = [
  { label: 'None', value: 'none' },
  { label: 'Stripe Green', value: 'stripe-green' },
  { label: 'Stripe Blue', value: 'stripe-blue' },
];

const DEFAULT_PADDING = {
  top: 12,
  right: 16,
  bottom: 12,
  left: 16,
};

export function BackgroundField({
  initialData = {},
  onDataChange,
  externalErrors = {}
}: BackgroundFieldProps) {
  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Log the incoming initial data for debugging
  console.log("BackgroundField received initialData:", initialData);

  const [formData, setFormData] = useState<BackgroundFieldData>(() => {
    // Initialize with defaults merged with any provided initial data
    return {
      backgroundType: initialData.backgroundType || 'solid',
      color1: initialData.color1 || 'rgb(0, 0, 0)',
      color2: initialData.color2 || 'rgb(255, 255, 255)',
      gradientValue: initialData.gradientValue || 'linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(255, 255, 255) 100%)',
      pattern: initialData.pattern || 'none',
      padding: initialData.padding || { ...DEFAULT_PADDING },
    };
  });

  // Instead of using an effect for validation on mount,
  // use a ref to track if we've already called onDataChange
  const hasCalledOnDataChange = useRef(false);

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    // Skip updates if hasCalledOnDataChange is already true (component already initialized)
    if (hasCalledOnDataChange.current) {
      console.log("BackgroundField already initialized, skipping initialData effect");
      return;
    }

    console.log("BackgroundField initialData changed, updating formData state");
    // Only update if significant initial data is available and different from current
    if ((initialData.backgroundType || initialData.color1) &&
        (initialData.backgroundType !== formData.backgroundType ||
         initialData.color1 !== formData.color1)) {
      setFormData({
        backgroundType: initialData.backgroundType || 'solid',
        color1: initialData.color1 || 'rgb(0, 0, 0)',
        color2: initialData.color2 || 'rgb(255, 255, 255)',
        gradientValue: initialData.gradientValue || 'linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(255, 255, 255) 100%)',
        pattern: initialData.pattern || 'none',
        padding: initialData.padding || { ...DEFAULT_PADDING },
      });
    }
  }, [initialData, formData.backgroundType, formData.color1]);

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Combine external and local errors
  const errors = useMemo(() => ({
    ...localErrors,
    ...externalErrors
  }), [localErrors, externalErrors]);

  /**
   * Updates the form data and notifies parent
   */
  const updateFormState = useCallback((updates: Partial<BackgroundFieldData>) => {
    // Check if we're actually changing something
    let hasChanged = false;
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof BackgroundFieldData;
      // @ts-ignore - We know these keys exist in both objects
      if (updates[typedKey] !== formData[typedKey]) {
        hasChanged = true;
      }
    });

    // Only update if something changed
    if (hasChanged) {
      setFormData(prevFormData => {
        // Validate data but don't notify parent here
        // (that will happen in the formData effect)
        return {
          ...prevFormData,
          ...updates
        };
      });
    }
  }, [formData]);

  /**
   * Validates the form data and sets error messages
   */
  const validateForm = useCallback(() => {
    try {
      backgroundFieldSchema.parse(formData);
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

  // Only run validation when formData changes, not on mount
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

  // Handler functions
  const onBackgroundTypeChange = useCallback((value: 'solid' | 'gradient') => {
    updateFormState({ backgroundType: value });
  }, [updateFormState]);

  const onColor1Change = useCallback((value: string) => {
    if (formData.backgroundType === 'solid') {
      updateFormState({ color1: value });
    } else {
      updateFormState({ gradientValue: value });
    }
  }, [formData.backgroundType, updateFormState]);

  const onPatternChange = useCallback((value: string) => {
    updateFormState({ pattern: value as 'none' | 'stripe-green' | 'stripe-blue' });
  }, [updateFormState]);

  const onPaddingChange = useCallback((value: number, position: 'top' | 'right' | 'bottom' | 'left') => {
    const newPadding = { ...formData.padding, [position]: value };
    updateFormState({ padding: newPadding });
  }, [formData.padding, updateFormState]);

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack align="start" gap="200">
            <Text variant="headingMd" as="h6">Background</Text>
            <Icon source="help"/>
          </InlineStack>

          <InlineStack gap="300">
            <RadioButton
              label="Solid"
              checked={formData.backgroundType === 'solid'}
              id="solid"
              name="background"
              onChange={() => onBackgroundTypeChange('solid')}
            />
            <RadioButton
              label="Gradient"
              checked={formData.backgroundType === 'gradient'}
              id="gradient"
              name="background"
              onChange={() => onBackgroundTypeChange('gradient')}
            />
          </InlineStack>

          {formData.backgroundType === 'solid' ? (
            <ColorPickerInput
              label="Color"
              value={formData.color1}
              onChange={onColor1Change}
              type="solid"
            />
          ) : (
            <ColorPickerInput
              label="Gradient"
              value={formData.gradientValue || "linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(255, 255, 255) 100%)"}
              onChange={onColor1Change}
              type="gradient"
            />
          )}

          <Select
            label="Pattern"
            options={patternOptions}
            value={formData.pattern}
            onChange={onPatternChange}
            error={hasError('pattern') ? getFieldErrorMessage('pattern') : undefined}
          />
        </BlockStack>
      </Box>
      <Box padding="400">
        <BlockStack gap="400">
          <Text variant="headingMd" as="h6">Padding</Text>

          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Padding top</Text>
                <RangeSlider
                  label="Padding top"
                  labelHidden
                  value={formData.padding.top}
                  onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'top')}
                  output
                  prefix={formData.padding.top}
                  suffix="px"
                  min={0}
                  max={50}
                />
              </BlockStack>
            </div>
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Padding right</Text>
                <RangeSlider
                  label="Padding right"
                  labelHidden
                  value={formData.padding.right}
                  onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'right')}
                  output
                  prefix={formData.padding.right}
                  suffix="px"
                  min={0}
                  max={50}
                />
              </BlockStack>
            </div>
          </InlineStack>

          <InlineStack gap="400" align="space-between">
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Padding bottom</Text>
                <RangeSlider
                  label="Padding bottom"
                  labelHidden
                  value={formData.padding.bottom}
                  onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'bottom')}
                  output
                  prefix={formData.padding.bottom}
                  suffix="px"
                  min={0}
                  max={50}
                />
              </BlockStack>
            </div>
            <div style={{width: '49%'}}>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">Padding left</Text>
                <RangeSlider
                  label="Padding left"
                  labelHidden
                  value={formData.padding.left}
                  onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'left')}
                  output
                  prefix={formData.padding.left}
                  suffix="px"
                  min={0}
                  max={50}
                />
              </BlockStack>
            </div>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}
