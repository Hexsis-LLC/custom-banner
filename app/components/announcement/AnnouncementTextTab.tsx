import {
  BlockStack,
} from "@shopify/polaris";
import type { ExtendedAnnouncementData} from "./form-fields/AnnouncementTextField";
import {AnnouncementTextField} from "./form-fields/AnnouncementTextField";
import {useFormContext} from "../../contexts/AnnouncementFormContext";
import { useMemo, useCallback, useEffect } from "react";
import type { FontType } from "../../types/announcement";

export function AnnouncementTextTab() {
  const { formData, handleFormChange, hasError, getFieldErrorMessage } = useFormContext();
  const isMultiText = formData.basic.type === 'multi_text';
  const isEditing = !!formData.basic.id;
  // Format the context data for the text field component
  const initialTextData = useMemo(() => {
    // Make sure we're providing all required fields with proper defaults
    return formData.text;
  }, [formData.text]);

  // Log the formatted initial data
  console.log("Formatted initialTextData:", initialTextData);

  // Extract text field errors from the form context
  const textFieldErrors = useMemo(() => {
    // Map field paths to their error messages
    const errorMap: Record<string, string> = {};

    // Check for errors in text fields
    const textFieldPaths = [
      'text.announcementText',
      'text.textColor',
      'text.fontSize',
      'text.fontType',
      'text.fontUrl',
      'text.languageCode'
    ];

    textFieldPaths.forEach(path => {
      if (hasError(path)) {
        // Convert from context path format to component path format
        const componentPath = path.replace('text.', '');
        errorMap[componentPath] = getFieldErrorMessage(path);
      }
    });

    return errorMap;
  }, [hasError, getFieldErrorMessage]);

  // Handle data changes from the text field component
  const handleTextDataChange = useCallback((data: ExtendedAnnouncementData, isValid: boolean) => {
    console.log("Text field data changed:", data);

    // Only update if there's an actual change
    const hasChanged =
      formData.text.announcementText !== data.announcementText ||
      formData.text.textColor !== data.textColor ||
      formData.text.fontSize !== data.fontSize ||
      formData.text.fontType !== data.fontType ||
      formData.text.fontUrl !== data.fontUrl ||
      formData.text.languageCode !== data.languageCode

    if (hasChanged) {
      // Update the form context with the new data
      handleFormChange('text', {
        announcementText: data.announcementText,
        textColor: data.textColor,
        fontSize: data.fontSize,
        fontType: data.fontType as FontType,
        fontUrl: data.fontUrl || '',
        languageCode: data.languageCode || '',
      });
    }
  }, [formData.text, handleFormChange]);

  // Log when component receives new formData
  useEffect(() => {
    console.log("AnnouncementTextTab received new formData", {
      isEditing,
      'text.announcementText': formData.text.announcementText,
      'text.textColor': formData.text.textColor,
    });
  }, [formData.text, isEditing]);

  return (
    <BlockStack gap="400">
      <AnnouncementTextField
        key={`text-field-${isEditing ? 'edit-' + formData.basic.id : 'new'}`}
        initialData={initialTextData}
        isMultiText={isMultiText}
        onDataChange={handleTextDataChange}
        externalErrors={textFieldErrors}
      />
    </BlockStack>
  );
}
