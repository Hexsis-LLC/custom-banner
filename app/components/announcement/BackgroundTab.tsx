import { BlockStack } from "@shopify/polaris";
import { BackgroundField } from "./form-fields/BackgroundField";
import { useFormContext } from "../../contexts/AnnouncementFormContext";
import { useMemo, useCallback, useEffect, useRef } from "react";
import type { BackgroundFieldData } from "../../schemas/schemas/BackgroundFieldSchema";

export function AnnouncementBackgroundTab() {
  const { formData, handleFormChange, hasError, getFieldErrorMessage } = useFormContext();
  const isEditing = !!formData.basic.id;
  const isInitialMount = useRef(true);

  // Format the context data for the background field component
  const initialBackgroundData = useMemo(() => {
    // Make sure we're providing all required fields with proper defaults
    return {
      backgroundType: (formData.background.backgroundType || 'solid') as 'solid' | 'gradient',
      color1: formData.background.color1 || 'rgb(0, 0, 0)',
      color2: formData.background.color2 || 'rgb(255, 255, 255)',
      gradientValue: formData.background.gradientValue || 'linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(255, 255, 255) 100%)',
      pattern: (formData.background.pattern || 'none') as 'none' | 'stripe-green' | 'stripe-blue',
      padding: formData.background.padding || {
        top: 12,
        right: 16,
        bottom: 12,
        left: 16,
      },
    };
  }, [formData.background]);

  // Log the formatted initial data
  console.log("Background tab: formatted initialBackgroundData:", initialBackgroundData);

  // Extract background field errors from the form context
  const backgroundFieldErrors = useMemo(() => {
    // Map field paths to their error messages
    const errorMap: Record<string, string> = {};

    // Check for errors in background fields
    const backgroundFieldPaths = [
      'background.backgroundType',
      'background.color1',
      'background.color2',
      'background.gradientValue',
      'background.pattern',
      'background.padding.top',
      'background.padding.right',
      'background.padding.bottom',
      'background.padding.left'
    ];

    backgroundFieldPaths.forEach(path => {
      if (hasError(path)) {
        // Convert from context path format to component path format
        const componentPath = path.replace('background.', '');
        errorMap[componentPath] = getFieldErrorMessage(path);
      }
    });

    return errorMap;
  }, [formData.background, hasError, getFieldErrorMessage]);

  // Handle data changes from the background field component
  const handleBackgroundDataChange = useCallback((data: BackgroundFieldData, isValid: boolean) => {
    // Skip logging if this is the initial mount
    if (!isInitialMount.current) {
      console.log("Background field data changed:", data, "isValid:", isValid);
    }

    // Update the form context with the new data
    handleFormChange('background', {
      backgroundType: data.backgroundType,
      color1: data.color1,
      color2: data.color2,
      gradientValue: data.gradientValue,
      pattern: data.pattern,
      padding: data.padding,
      // Keep these fields in sync too for API compatibility
      backgroundColor: data.backgroundType === 'solid' ? data.color1 : undefined,
      backgroundPattern: data.pattern !== 'none' ? data.pattern : undefined,
    });
  }, [handleFormChange, isInitialMount]);

  // Log when component receives new formData
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    console.log("AnnouncementBackgroundTab received new formData", {
      isEditing,
      'background.backgroundType': formData.background.backgroundType,
      'background.color1': formData.background.color1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.background]);

  return (
    <BlockStack gap="400">
      <BackgroundField
        key={`background-field-${isEditing ? 'edit' : 'new'}`}
        initialData={initialBackgroundData}
        onDataChange={handleBackgroundDataChange}
        externalErrors={backgroundFieldErrors}
      />
    </BlockStack>
  );
}
