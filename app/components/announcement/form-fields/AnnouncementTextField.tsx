import {BlockStack, Box, Button, Card, Icon, InlineStack, RangeSlider, Text, TextField} from "@shopify/polaris";
import {DeleteIcon, PlusIcon} from "@shopify/polaris-icons";
import type {TextEntry, FontType} from "../../../types/announcement";
import {useCallback, useMemo, useState, useEffect} from "react";
import { ColorPickerInput } from "app/components/ColorPickerInput";
import { FontSection } from "../fontSection";
import type { AnnouncementTextFieldData } from "../../../schemas/schemas/AnnouncementTextFieldSchema";
import { announcementTextFieldSchema } from "../../../schemas/schemas/AnnouncementTextFieldSchema";
import { ZodError } from "zod";

// Extended type that includes TextEntries
export type ExtendedAnnouncementData = AnnouncementTextFieldData & {
  textEntries?: TextEntry[]
};

interface AnnouncementTextFieldProps {
  initialData?: Partial<ExtendedAnnouncementData>;
  isMultiText?: boolean;
  onDataChange: (data: ExtendedAnnouncementData, isValid: boolean) => void;
  externalErrors?: Record<string, string>;
}

const MAX_TEXT_ENTRIES = 5;
const DEFAULT_FONT_SIZE = {
  MIN: 12,
  MAX: 32,
};

const DEFAULT_TEXT_ENTRY: TextEntry = {
  id: '1',
  announcementText: '',
  textColor: 'rgb(0, 0, 0)',
  fontSize: 16,
  fontType: 'site' as FontType,
  fontUrl: '',
  languageCode: '',
};

/**
 * Component for managing announcement text entries with support for multiple text blocks
 */
export function AnnouncementTextField({
  initialData = {},
  isMultiText = false,
  onDataChange,
  externalErrors = {}
}: AnnouncementTextFieldProps) {
  // Log the incoming initial data for debugging
  console.log("TextField received initialData:", initialData);

  const [formData, setFormData] = useState<ExtendedAnnouncementData>(() => {
    // Initialize with defaults merged with any provided initial data
    return {
      announcementText: initialData.announcementText || '',
      textColor: initialData.textColor || 'rgb(0, 0, 0)',
      fontSize: initialData.fontSize || 16,
      fontType: (initialData.fontType as FontType) || 'site',
      fontUrl: initialData.fontUrl || '',
      languageCode: initialData.languageCode || '',
      textEntries: initialData.textEntries || [{ ...DEFAULT_TEXT_ENTRY }],
    };
  });

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    console.log("initialData changed, updating formData state");
    // Only update if significant initial data is available (to prevent overwriting with defaults)
    if (initialData.announcementText || initialData.textEntries?.length) {
      setFormData({
        announcementText: initialData.announcementText || '',
        textColor: initialData.textColor || 'rgb(0, 0, 0)',
        fontSize: initialData.fontSize || 16,
        fontType: (initialData.fontType as FontType) || 'site',
        fontUrl: initialData.fontUrl || '',
        languageCode: initialData.languageCode || '',
        textEntries: initialData.textEntries || [{ ...DEFAULT_TEXT_ENTRY }],
      });
    }
  }, [initialData]);

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Combine external and local errors
  const errors = useMemo(() => ({
    ...localErrors,
    ...externalErrors
  }), [localErrors, externalErrors]);

  // Convert existing single text to entries format if needed
  const textEntries = useMemo<TextEntry[]>(() => {
    // If we already have text entries, use them
    if (formData.textEntries && formData.textEntries.length > 0) {
      console.log("Using existing text entries:", formData.textEntries);
      return formData.textEntries;
    }

    // Otherwise create a single entry from the main text data
    console.log("Creating default text entry from main data");
    return [{
      id: '1',
      announcementText: formData.announcementText,
      textColor: formData.textColor,
      fontSize: formData.fontSize,
      fontType: formData.fontType as FontType,
      fontUrl: formData.fontUrl || '',
      languageCode: formData.languageCode || '',
    }];
  }, [formData]);

  /**
   * Updates the form state with new text entries and syncs the main fields
   */
  const updateFormState = useCallback((updatedEntries: TextEntry[]) => {
    const newFormData = {
      ...formData,
      textEntries: updatedEntries,
      // Keep the main fields in sync with the first entry
      announcementText: updatedEntries[0].announcementText,
      textColor: updatedEntries[0].textColor,
      fontSize: updatedEntries[0].fontSize,
      fontType: updatedEntries[0].fontType,
      fontUrl: updatedEntries[0].fontUrl,
      languageCode: updatedEntries[0].languageCode,
    };

    setFormData(newFormData);

    // Validate and notify parent of changes
    const isValid = validateData(newFormData);
    onDataChange(newFormData, isValid);
  }, [formData, onDataChange]);

  /**
   * Creates and adds a new text entry
   */
  const addNewText = useCallback(() => {
    if (textEntries.length >= MAX_TEXT_ENTRIES) return;

    const newEntry: TextEntry = {
      id: Date.now().toString(),
      announcementText: '',
      textColor: formData.textColor,
      fontSize: formData.fontSize,
      fontType: formData.fontType as FontType,
      fontUrl: formData.fontUrl || '',
      languageCode: '',
    };

    updateFormState([...textEntries, newEntry]);
  }, [textEntries, formData, updateFormState]);

  /**
   * Removes a text entry by ID
   */
  const removeText = useCallback((id: string) => {
    if (textEntries.length <= 1) return;
    const updatedEntries = textEntries.filter(entry => entry.id !== id);
    updateFormState(updatedEntries);
  }, [textEntries, updateFormState]);

  /**
   * Updates a specific field in a text entry
   */
  const updateTextEntry = useCallback((id: string, field: keyof TextEntry, value: string | number) => {
    const updatedEntries = textEntries.map(entry => {
      if (entry.id !== id) return entry;

      // Special handling for font type changes
      if (field === 'fontType') {
        const fontType = value as FontType;
        return {
          ...entry,
          fontType,
          // Clear font URL when switching to site font
          fontUrl: fontType === 'site' ? '' : entry.fontUrl,
        };
      }

      return { ...entry, [field]: value };
    });

    updateFormState(updatedEntries);
  }, [textEntries, updateFormState]);

  /**
   * Validates the form data without setting errors (for internal use)
   */
  const validateData = useCallback((dataToValidate: ExtendedAnnouncementData): boolean => {
    try {
      // Validate the primary data using the schema
      announcementTextFieldSchema.parse({
        announcementText: dataToValidate.announcementText,
        textColor: dataToValidate.textColor,
        fontSize: dataToValidate.fontSize,
        fontType: dataToValidate.fontType,
        fontUrl: dataToValidate.fontUrl,
        languageCode: dataToValidate.languageCode,
      });

      // For multi-text entries, validate each entry
      if (isMultiText && dataToValidate.textEntries && dataToValidate.textEntries.length > 1) {
        dataToValidate.textEntries.forEach((entry, index) => {
          if (index === 0) return; // Skip first entry, already validated
          announcementTextFieldSchema.parse({
            announcementText: entry.announcementText,
            textColor: entry.textColor,
            fontSize: entry.fontSize,
            fontType: entry.fontType,
            fontUrl: entry.fontUrl,
            languageCode: entry.languageCode,
          });
        });
      }

      return true;
    } catch (error) {
      return false;
    }
  }, [isMultiText]);

  /**
   * Validates the form data and sets error messages
   */
  const validateForm = useCallback(() => {
    try {
      // Validate the primary data using the schema
      announcementTextFieldSchema.parse({
        announcementText: formData.announcementText,
        textColor: formData.textColor,
        fontSize: formData.fontSize,
        fontType: formData.fontType,
        fontUrl: formData.fontUrl,
        languageCode: formData.languageCode,
      });

      // For multi-text entries, validate each entry
      if (isMultiText && textEntries.length > 1) {
        textEntries.forEach((entry, index) => {
          if (index === 0) return; // Skip first entry, already validated
          announcementTextFieldSchema.parse({
            announcementText: entry.announcementText,
            textColor: entry.textColor,
            fontSize: entry.fontSize,
            fontType: entry.fontType,
            fontUrl: entry.fontUrl,
            languageCode: entry.languageCode,
          });
        });
      }

      // Clear errors if validation passes
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
  }, [formData, textEntries, isMultiText]);

  // Run validation when component mounts or external errors change
  useEffect(() => {
    validateForm();
  }, [externalErrors, validateForm]);

  // Notify parent component about validation state on mount and when data changes
  useEffect(() => {
    const isValid = validateForm();
    onDataChange(formData, isValid);
  }, [formData, validateForm, onDataChange]);

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

  /**
   * Gets the validation path based on the entry index
   */
  const getValidationPath = useCallback((index: number, field: string) => {
    return index === 0 ? field : `textEntries.${index}.${field}`;
  }, []);

  /**
   * Renders a single text entry
   */
  const renderTextEntry = useCallback((entry: TextEntry, index: number) => {
    const showDeleteButton = isMultiText && textEntries.length > 1;
    const messageLabel = isMultiText && textEntries.length > 1 ? `Text Message ${index + 1}` : 'Text Message';

    return (
      <BlockStack key={entry.id} gap="400">
        {/* Text Entry Section */}
        <InlineStack align="start" gap="200">
          <div style={{ flex: 1 }}>
            <TextField
              label={messageLabel}
              multiline={4}
              placeholder="Enter your announcement text"
              autoComplete="off"
              value={entry.announcementText}
              onChange={(value) => updateTextEntry(entry.id, 'announcementText', value)}
              error={hasError(getValidationPath(index, 'announcementText'))}
              helpText={hasError(getValidationPath(index, 'announcementText')) ?
                getFieldErrorMessage(getValidationPath(index, 'announcementText')) : undefined}
            />
          </div>
          {showDeleteButton && (
            <Button
              icon={DeleteIcon}
              variant="plain"
              onClick={() => removeText(entry.id)}
            />
          )}
        </InlineStack>

        {/* Text Color and Font Size Section */}
        <InlineStack gap="400" align="space-between">
          <div style={{width: '49%'}}>
            <ColorPickerInput
              label="Text Color"
              value={entry.textColor || "rgb(0, 0, 0)"}
              onChange={(newColor) => updateTextEntry(entry.id, 'textColor', newColor)}
              type="solid"
            />
          </div>
          <div style={{width: '49%'}}>
            <BlockStack gap="200">
              <Text variant="bodyMd" as="p">Font size</Text>
              <RangeSlider
                label="Font size"
                labelHidden
                prefix={entry.fontSize}
                value={entry.fontSize}
                onChange={(value) => updateTextEntry(entry.id, 'fontSize', typeof value === 'number' ? value : value[0])}
                output
                suffix="px"
                min={DEFAULT_FONT_SIZE.MIN}
                max={DEFAULT_FONT_SIZE.MAX}
              />
            </BlockStack>
          </div>
        </InlineStack>

        {/* Font Section */}
        <FontSection
          fontType={entry.fontType}
          fontUrl={entry.fontUrl}
          hasError={(field) => hasError(getValidationPath(index, field))}
          getFieldErrorMessage={(field) => getFieldErrorMessage(getValidationPath(index, field))}
          onFontTypeChange={(value) => updateTextEntry(entry.id, 'fontType', value)}
          onFontUrlChange={(value) => updateTextEntry(entry.id, 'fontUrl', value)}
          errorPath={getValidationPath(index, '')}
        />

        {/* Separator between entries */}
        {isMultiText && index < textEntries.length - 1 && (
          <div style={{ borderBottom: '1px solid #ddd', margin: '16px 0' }} />
        )}
      </BlockStack>
    );
  }, [isMultiText, textEntries.length, updateTextEntry, hasError, getFieldErrorMessage, getValidationPath, removeText]);

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <InlineStack align="start" gap="200">
              <Text variant="headingMd" as="h6">Message</Text>
              <Icon source="help" />
            </InlineStack>
            {isMultiText && (
              <Button
                onClick={addNewText}
                icon={PlusIcon}
                variant="primary"
                disabled={textEntries.length >= MAX_TEXT_ENTRIES}
              >
                Add Text
              </Button>
            )}
          </InlineStack>

          {textEntries.map((entry, index) => renderTextEntry(entry, index))}
        </BlockStack>
      </Box>
    </Card>
  );
}
