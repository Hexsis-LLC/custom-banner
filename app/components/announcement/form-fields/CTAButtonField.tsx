import {
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  RadioButton,
  TextField,
  RangeSlider,
  Box,
} from "@shopify/polaris";
import { FontSection } from "../fontSection";
import { ColorPickerInput } from "app/components/ColorPickerInput";
import { ctaButtonFieldSchema, CTAButtonFieldData } from "../../../schemas/schemas/CTAButtonFieldSchema";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { ZodError } from "zod";
import type { FontType } from "../../../types/announcement";

type CTAType = 'regular' | 'bar' | 'link' | 'none';

interface CTAButtonFieldProps {
  initialData?: Partial<CTAButtonFieldData>;
  onDataChange: (data: CTAButtonFieldData, isValid: boolean) => void;
  externalErrors?: Record<string, string>;
}

const DEFAULT_PADDING = {
  top: 8,
  right: 16,
  bottom: 8,
  left: 16,
};

export function CTAButtonField({
  initialData = {},
  onDataChange,
  externalErrors = {}
}: CTAButtonFieldProps) {
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const hasCalledOnDataChange = useRef(false);

  // Log the incoming initial data for debugging
  console.log("CTAButtonField received initialData:", initialData);

  const [formData, setFormData] = useState<CTAButtonFieldData>(() => {
    // Initialize with defaults merged with any provided initial data
    const baseData = {
      ctaType: (initialData.ctaType as CTAType) || 'none',
      padding: initialData.padding || { ...DEFAULT_PADDING },
      fontType: initialData.fontType || 'site',
      fontUrl: initialData.fontUrl || '',
      buttonFontColor: initialData.buttonFontColor || 'rgb(0, 0, 0)',
      buttonBackgroundColor: initialData.buttonBackgroundColor || 'rgb(255, 255, 255)',
      ctaText: initialData.ctaText || 'Click Here',
      ctaLink: initialData.ctaLink || 'https://',
    };

    // Add textColor only if it's a link type (to avoid type errors)
    if (baseData.ctaType === 'link') {
      return {
        ...baseData,
        textColor: (initialData as any).textColor || 'rgb(255, 255, 255)',
      } as CTAButtonFieldData;
    }

    return baseData as CTAButtonFieldData;
  });

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    // Skip updates if hasCalledOnDataChange is already true (component already initialized)
    if (hasCalledOnDataChange.current) {
      console.log("CTAButtonField already initialized, skipping initialData effect");
      return;
    }

    console.log("CTAButtonField initialData received:", initialData);

    // Only update if significant initial data is available
    if (initialData.ctaType) {
      const baseData = {
        ctaType: (initialData.ctaType as CTAType) || 'none',
        padding: initialData.padding || { ...DEFAULT_PADDING },
        // Only use the explicit CTA font settings, never inherit from message
        fontType: initialData.fontType || 'site',
        fontUrl: initialData.fontUrl || '',
        buttonFontColor: initialData.buttonFontColor || 'rgb(0, 0, 0)',
        buttonBackgroundColor: initialData.buttonBackgroundColor || 'rgb(255, 255, 255)',
        ctaText: initialData.ctaText || 'Click Here',
        ctaLink: initialData.ctaLink || 'https://',
      };

      // Add textColor only if it's a link type
      if (initialData.ctaType === 'link' || baseData.ctaType === 'link') {
        setFormData({
          ...baseData,
          textColor: (initialData as any).textColor || 'rgb(255, 255, 255)',
        } as CTAButtonFieldData);
      } else {
        setFormData(baseData as CTAButtonFieldData);
      }

      console.log("CTAButtonField initialized with font:", baseData.fontType, baseData.fontUrl);
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
  const updateFormState = useCallback((updates: Partial<CTAButtonFieldData>) => {
    // Check if we're actually changing something
    let hasChanged = false;
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof CTAButtonFieldData;
      // @ts-ignore - We know these keys exist in both objects
      if (updates[typedKey] !== formData[typedKey]) {
        hasChanged = true;
      }
    });

    // Only update if something changed
    if (hasChanged) {
      console.log("CTAButtonField updating state with:", updates);
      setFormData(prevFormData => {
        const newFormData = {
          ...prevFormData,
          ...updates
        } as CTAButtonFieldData;

        // Will trigger the useEffect for formData that will validate and notify parent
        return newFormData;
      });
    }
  }, [formData]);



  /**
   * Validates the form data and sets error messages
   */
  const validateForm = useCallback(() => {
    try {
      ctaButtonFieldSchema.parse(formData);
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

    // Track any font changes
    console.log("CTAButtonField form data changed, fontType:", formData.fontType, "fontUrl:", formData.fontUrl);

    // For subsequent updates, validate and notify parent
    const isValid = validateForm();

    // Prevent recursive updates by ensuring we don't notify parent with the same data
    if (hasCalledOnDataChange.current) {
      console.log("Notifying parent about CTA changes", formData);
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
  const onCtaTypeChange = useCallback((value: CTAType) => {
    updateFormState({ ctaType: value });
  }, [updateFormState]);

  const onPaddingChange = useCallback((value: number, position: 'top' | 'right' | 'bottom' | 'left') => {
    const newPadding = { ...formData.padding, [position]: value };
    updateFormState({ padding: newPadding });
  }, [formData.padding, updateFormState]);

  const onFontTypeChange = useCallback((value: string) => {
    // When font type changes, only update the CTA font setting
    // This ensures the message font settings remain unchanged
    console.log("CTAButtonField: Font type changing to:", value);
    console.log("This should ONLY affect CTA button font, not message font");

    // First update the font type
    setFormData(prevData => {
      const newData = {
        ...prevData,
        fontType: value,
        // Clear font URL when switching to site font
        fontUrl: value === 'site' ? '' : prevData.fontUrl
      };

      // A separate setFormData call prevents batching issues
      // that could cause updates to get lost
      return newData;
    });
  }, []);

  const onFontUrlChange = useCallback((value: string) => {
    // When font URL changes, only update the CTA font URL
    // This ensures the message font URL remains unchanged
    console.log("CTAButtonField: Font URL changing to:", value);
    console.log("This should ONLY affect CTA button font URL, not message font URL");

    // Use setFormData directly to ensure the change is captured
    setFormData(prevData => ({
      ...prevData,
      fontUrl: value
    }));
  }, []);

  const onCtaTextChange = useCallback((value: string) => {
    updateFormState({ ctaText: value });
  }, [updateFormState]);

  const onCtaLinkChange = useCallback((value: string) => {
    updateFormState({ ctaLink: value });
  }, [updateFormState]);

  const onCtaButtonFontColorChange = useCallback((value: string) => {
    updateFormState({ buttonFontColor: value });
  }, [updateFormState]);

  const onCtaButtonBackgroundColorChange = useCallback((value: string) => {
    updateFormState({ buttonBackgroundColor: value });
  }, [updateFormState]);

  const onCtaLinkTextColorChange = useCallback((value: string) => {
    updateFormState({ textColor: value });
  }, [updateFormState]);

  const renderFields = useCallback(() => {
    switch (formData.ctaType) {
      case 'link': {
        // For link type, we need to cast to access textColor
        const linkFormData = formData as Extract<CTAButtonFieldData, { ctaType: 'link' }>;
        return (
          <BlockStack gap="400">
            <TextField
              label="Button Text"
              value={linkFormData.ctaText || ''}
              onChange={onCtaTextChange}
              autoComplete="off"
              error={hasError('ctaText')}
              helpText={hasError('ctaText') ? getFieldErrorMessage('ctaText') : undefined}
            />
            <TextField
              label="Link URL"
              value={linkFormData.ctaLink || ''}
              onChange={onCtaLinkChange}
              autoComplete="off"
              error={hasError('ctaLink')}
              helpText={hasError('ctaLink') ? getFieldErrorMessage('ctaLink') : undefined}
            />
            <ColorPickerInput
              label="Link Text Color"
              value={linkFormData.textColor || "rgb(255, 255, 255)"}
              onChange={onCtaLinkTextColorChange}
              type="solid"
            />
          </BlockStack>
        );
      }
      case 'regular':
        return (
          <BlockStack gap="400">
            <TextField
              label="Button Text"
              value={formData.ctaText || ''}
              onChange={onCtaTextChange}
              autoComplete="off"
              error={hasError('ctaText')}
              helpText={hasError('ctaText') ? getFieldErrorMessage('ctaText') : undefined}
            />
            <TextField
              label="Link URL"
              value={formData.ctaLink || ''}
              onChange={onCtaLinkChange}
              autoComplete="off"
              error={hasError('ctaLink')}
              helpText={hasError('ctaLink') ? getFieldErrorMessage('ctaLink') : undefined}
            />
            {formData.ctaType === 'regular' && (
              <InlineStack gap="400" align="space-between">
                <div style={{width: '49%'}}>
                  <ColorPickerInput
                    label="Button Text Color"
                    value={formData.buttonFontColor || "rgb(0, 0, 0)"}
                    onChange={onCtaButtonFontColorChange}
                    type="solid"
                  />
                </div>
                <div style={{width: '49%'}}>
                  <ColorPickerInput
                    label="Button Background Color"
                    value={formData.buttonBackgroundColor || "rgb(255, 255, 255)"}
                    onChange={onCtaButtonBackgroundColorChange}
                    type="solid"
                  />
                </div>
              </InlineStack>
            )}
          </BlockStack>
        );
      case 'bar':
        return (
          <TextField
            label="Link URL"
            value={formData.ctaLink || ''}
            onChange={onCtaLinkChange}
            autoComplete="off"
            error={hasError('ctaLink')}
            helpText={hasError('ctaLink') ? getFieldErrorMessage('ctaLink') : undefined}
          />
        );
      default:
        return null;
    }
  }, [
    formData.ctaType,
    formData.ctaText,
    formData.ctaLink,
    formData.buttonFontColor,
    formData.buttonBackgroundColor,
    onCtaTextChange,
    onCtaLinkChange,
    onCtaLinkTextColorChange,
    onCtaButtonFontColorChange,
    onCtaButtonBackgroundColorChange,
    hasError,
    getFieldErrorMessage
  ]);

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          {/* CTA Type Section */}
          <BlockStack gap="400">
            <InlineStack align="start" gap="200">
              <Text variant="headingMd" as="h6">CTA</Text>
              <Icon source="help"/>
            </InlineStack>

            <InlineStack gap="300">
              <RadioButton
                label="Clickable link"
                checked={formData.ctaType === 'link'}
                id="cta-link"
                name="cta-type-radio"
                onChange={() => onCtaTypeChange('link')}
              />
              <RadioButton
                label="Clickable bar"
                checked={formData.ctaType === 'bar'}
                id="cta-bar"
                name="cta-type-radio"
                onChange={() => onCtaTypeChange('bar')}
              />
              <RadioButton
                label="Regular Button"
                checked={formData.ctaType === 'regular'}
                id="cta-regular"
                name="cta-type-radio"
                onChange={() => onCtaTypeChange('regular')}
              />
              <RadioButton
                label="None"
                checked={formData.ctaType === 'none'}
                id="cta-none"
                name="cta-type-radio"
                onChange={() => onCtaTypeChange('none')}
              />
            </InlineStack>
          </BlockStack>

          {/* Conditional Fields */}
          {renderFields()}

          {/* Font Section - Only show for link and regular types */}
          {(formData.ctaType === 'link' || formData.ctaType === 'regular') && (
            <BlockStack gap="400">
              <Text variant="headingMd" as="h6">CTA Button Font</Text>
              <FontSection
                fontType={formData.fontType as FontType}
                fontUrl={formData.fontUrl}
                hasError={(field) => hasError(`fontType.${field}`)}
                getFieldErrorMessage={(field) => getFieldErrorMessage(`fontType.${field}`)}
                onFontTypeChange={onFontTypeChange}
                onFontUrlChange={onFontUrlChange}
                errorPath="cta"
                sectionId="cta-font"
              />
            </BlockStack>
          )}

          {/* Padding Section - Only show for regular button type */}
          {formData.ctaType === 'regular' && (
            <>
              <Text variant="headingMd" as="h6">Padding</Text>
              <InlineStack gap="400" align="space-between">
                <div style={{width: '49%'}}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">Padding top</Text>
                    <RangeSlider
                      label="Padding top"
                      labelHidden
                      value={formData.padding.top}
                      prefix={formData.padding.top}
                      onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'top')}
                      output
                      suffix="px"
                      min={0}
                      max={50}
                    />
                    {hasError('padding.top') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('padding.top')}</Text>
                    )}
                  </BlockStack>
                </div>
                <div style={{width: '49%'}}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">Padding right</Text>
                    <RangeSlider
                      label="Padding right"
                      labelHidden
                      value={formData.padding.right}
                      prefix={formData.padding.right}
                      onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'right')}
                      output
                      suffix="px"
                      min={0}
                      max={50}
                    />
                    {hasError('padding.right') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('padding.right')}</Text>
                    )}
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
                      prefix={formData.padding.bottom}
                      onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'bottom')}
                      output
                      suffix="px"
                      min={0}
                      max={50}
                    />
                    {hasError('padding.bottom') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('padding.bottom')}</Text>
                    )}
                  </BlockStack>
                </div>
                <div style={{width: '49%'}}>
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">Padding left</Text>
                    <RangeSlider
                      label="Padding left"
                      labelHidden
                      value={formData.padding.left}
                      prefix={formData.padding.left}
                      onChange={(value) => onPaddingChange(typeof value === 'number' ? value : value[0], 'left')}
                      output
                      suffix="px"
                      min={0}
                      max={50}
                    />
                    {hasError('padding.left') && (
                      <Text tone="critical" as="span">{getFieldErrorMessage('padding.left')}</Text>
                    )}
                  </BlockStack>
                </div>
              </InlineStack>
            </>
          )}
        </BlockStack>
      </Box>
    </Card>
  );
}
