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
    return {
      announcementText: formData.text.announcementText || '',
      textColor: formData.text.textColor || 'rgb(0, 0, 0)',
      fontSize: formData.text.fontSize || 16,
      fontType: (formData.text.fontType as FontType) || 'site' as FontType,
      fontUrl: formData.text.fontUrl || '',
      languageCode: formData.text.languageCode || '',
      // If we have text entries, use them; otherwise create a default entry from the main text data
      textEntries: formData.text.textEntries || [{
        id: '1',
        announcementText: formData.text.announcementText || '',
        textColor: formData.text.textColor || 'rgb(0, 0, 0)',
        fontSize: formData.text.fontSize || 16,
        fontType: (formData.text.fontType as FontType) || 'site' as FontType,
        fontUrl: formData.text.fontUrl || '',
        languageCode: formData.text.languageCode || '',
      }],
    };
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

    // Check for errors in text entries
    if (isMultiText && formData.text.textEntries) {
      formData.text.textEntries.forEach((_, index) => {
        textFieldPaths.forEach(basePath => {
          const entryPath = basePath.replace('text.', `text.textEntries.${index}.`);
          const componentPath = entryPath.replace('text.', '');

          if (hasError(entryPath)) {
            errorMap[componentPath] = getFieldErrorMessage(entryPath);
          }
        });
      });
    }

    return errorMap;
  }, [formData.text, hasError, getFieldErrorMessage, isMultiText]);

  // Handle data changes from the text field component
  const handleTextDataChange = useCallback((data: ExtendedAnnouncementData, isValid: boolean) => {
    console.log("Text field data changed:", data);

    // Update the form context with the new data
    handleFormChange('text', {
      announcementText: data.announcementText,
      textColor: data.textColor,
      fontSize: data.fontSize,
      fontType: data.fontType as FontType,
      fontUrl: data.fontUrl || '',
      languageCode: data.languageCode || '',
      textEntries: data.textEntries,
    });

    // Track validity state
  }, [handleFormChange]);

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
        key={`text-field-${isEditing ? 'edit-' + formData.basic.id : 'new'}-${formData.text.announcementText}`}
        initialData={initialTextData}
        isMultiText={isMultiText}
        onDataChange={handleTextDataChange}
        externalErrors={textFieldErrors}
      />
      {/* Future fields can be added here */}
      {isMultiText && (
        // Additional fields for multi-text type can be added here
        <></>
      )}
    </BlockStack>
  );
}
