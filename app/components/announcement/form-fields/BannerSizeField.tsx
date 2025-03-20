import {
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  RadioButton,
  Box,
} from "@shopify/polaris";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { z } from "zod";

// Define schema for banner size
const bannerSizeSchema = z.object({
  size: z.enum(['small', 'mid', 'large', 'custom']),
  sizeHeight: z.string(),
  sizeWidth: z.string(),
}).superRefine((data, ctx) => {
  if (data.size === 'custom') {
    // Validate height
    if (!data.sizeHeight || data.sizeHeight.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Height is required for custom size",
        path: ['sizeHeight'],
      });
    } else if (isNaN(Number(data.sizeHeight)) || Number(data.sizeHeight) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Height must be a positive number",
        path: ['sizeHeight'],
      });
    }

    // Validate width
    if (!data.sizeWidth || data.sizeWidth.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Width is required for custom size",
        path: ['sizeWidth'],
      });
    } else {
      const width = Number(data.sizeWidth);
      if (isNaN(width) || width <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Width must be a positive number",
          path: ['sizeWidth'],
        });
      } else if (width > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Width cannot be more than 100%",
          path: ['sizeWidth'],
        });
      }
    }
  }
});

type BannerSizeData = z.infer<typeof bannerSizeSchema>;
type Size = 'small' | 'mid' | 'large' | 'custom';

interface BannerSizeFieldProps {
  initialData?: Partial<BannerSizeData>;
  onDataChange: (data: BannerSizeData, isValid: boolean) => void;
  externalErrors?: Record<string, string>;
}

export function BannerSizeField({
  initialData = {},
  onDataChange,
  externalErrors = {}
}: BannerSizeFieldProps) {
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const hasCalledOnDataChange = useRef(false);
  
  const [formData, setFormData] = useState<BannerSizeData>(() => {
    return {
      size: initialData.size || 'mid',
      sizeHeight: initialData.sizeHeight || '50',
      sizeWidth: initialData.sizeWidth || '100',
    };
  });

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    // Skip updates if hasCalledOnDataChange is already true (component already initialized)
    if (hasCalledOnDataChange.current) {
      return;
    }
    
    // Only update if we have significant initial data
    if (initialData.size) {
      setFormData(prev => ({
        ...prev,
        size: initialData.size || prev.size,
        sizeHeight: initialData.sizeHeight || prev.sizeHeight,
        sizeWidth: initialData.sizeWidth || prev.sizeWidth,
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
      bannerSizeSchema.parse(formData);
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

  const onSizeChange = useCallback((value: Size) => {
    setFormData(prev => ({
      ...prev,
      size: value
    }));
  }, []);

  const onCustomHeightChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      sizeHeight: value
    }));
  }, []);

  const onCustomWidthChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      sizeWidth: value
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
          <InlineStack align="start" gap="200">
            <Text variant="headingMd" as="h6">Size</Text>
            <Icon source="help"/>
          </InlineStack>

          <InlineStack gap="300">
            <RadioButton
              label="Small"
              checked={formData.size === 'small'}
              id="small"
              name="size"
              onChange={() => onSizeChange('small')}
            />
            <RadioButton
              label="Medium"
              checked={formData.size === 'mid'}
              id="mid"
              name="size"
              onChange={() => onSizeChange('mid')}
            />
            <RadioButton
              label="Large"
              checked={formData.size === 'large'}
              id="large"
              name="size"
              onChange={() => onSizeChange('large')}
            />
            <RadioButton
              label="Custom"
              checked={formData.size === 'custom'}
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
                value={formData.sizeHeight}
                onChange={onCustomHeightChange}
                suffix="px"
                autoComplete="off"
                disabled={formData.size !== 'custom'}
                error={hasError('sizeHeight')}
                helpText={hasError('sizeHeight') ? getFieldErrorMessage('sizeHeight') : undefined}
              />
            </div>
            <div style={{width: '49%'}}>
              <TextField
                label="Width"
                type="number"
                value={formData.sizeWidth}
                suffix="%"
                onChange={onCustomWidthChange}
                autoComplete="off"
                disabled={formData.size !== 'custom'}
                error={hasError('sizeWidth')}
                helpText={hasError('sizeWidth') ? getFieldErrorMessage('sizeWidth') : undefined}
              />
            </div>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
} 