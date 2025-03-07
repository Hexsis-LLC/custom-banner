import {BlockStack, Box, Button, Card, Icon, InlineStack, RangeSlider, Text, TextField,} from "@shopify/polaris";
import {useFormContext} from "../../../contexts/AnnouncementFormContext";
import {FontSection} from "../fontSection";
import {DeleteIcon, PlusIcon} from "@shopify/polaris-icons";
import type {TextEntry, FontType} from "../../../types/announcement";
import {useCallback, useMemo} from "react";
import { ColorPickerInput } from "app/components/ColorPickerInput";

interface AnnouncementTextFieldProps {
  isMultiText: boolean;
}

const MAX_TEXT_ENTRIES = 5;
const DEFAULT_FONT_SIZE = {
  MIN: 12,
  MAX: 32,
};

/**
 * Component for managing announcement text entries with support for multiple text blocks
 */
export function AnnouncementTextField({ isMultiText }: AnnouncementTextFieldProps) {
  const { formData, handleFormChange, hasError, getFieldErrorMessage } = useFormContext();

  // Convert existing single text to entries format if needed
  const textEntries = useMemo<TextEntry[]>(() => {
    return formData.text.textEntries || [{
      id: '1',
      announcementText: formData.text.announcementText,
      textColor: formData.text.textColor,
      fontSize: formData.text.fontSize,
      fontType: formData.text.fontType,
      fontUrl: formData.text.fontUrl,
      languageCode: formData.text.languageCode || '',
    }];
  }, [formData.text]);

  /**
   * Updates the form state with new text entries and syncs the main fields
   */
  const updateFormState = useCallback((updatedEntries: TextEntry[]) => {
    handleFormChange('text', {
      ...formData.text,
      textEntries: updatedEntries,
      // Keep the main fields in sync with the first entry
      announcementText: updatedEntries[0].announcementText,
      textColor: updatedEntries[0].textColor,
      fontSize: updatedEntries[0].fontSize,
      fontType: updatedEntries[0].fontType,
      fontUrl: updatedEntries[0].fontUrl,
      languageCode: updatedEntries[0].languageCode,
    });
  }, [formData.text, handleFormChange]);

  /**
   * Creates and adds a new text entry
   */
  const addNewText = useCallback(() => {
    if (textEntries.length >= MAX_TEXT_ENTRIES) return;

    const newEntry: TextEntry = {
      id: Date.now().toString(),
      announcementText: '',
      textColor: formData.text.textColor,
      fontSize: formData.text.fontSize,
      fontType: formData.text.fontType,
      fontUrl: formData.text.fontUrl,
      languageCode: '',
    };

    updateFormState([...textEntries, newEntry]);
  }, [textEntries, formData.text, updateFormState]);

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

    const updates = {
      ...formData.text,
      textEntries: updatedEntries,
    };

    // Update main fields if the first entry is being modified
    if (id === textEntries[0].id) {
      const mainFieldMapping: Partial<Record<keyof TextEntry, keyof typeof formData.text>> = {
        announcementText: 'announcementText',
        textColor: 'textColor',
        fontSize: 'fontSize',
        fontType: 'fontType',
        fontUrl: 'fontUrl',
        languageCode: 'languageCode',
      };

      const mainField = mainFieldMapping[field];
      if (mainField) {
        (updates as any)[mainField] = field === 'fontType' ? value as FontType : value;

        // Clear font URL in main fields when switching to site font
        if (field === 'fontType' && value === 'site') {
          (updates as any).fontUrl = '';
        }
      }
    }

    handleFormChange('text', updates);
  }, [textEntries, formData, handleFormChange]);

  /**
   * Gets the validation path based on the entry index
   */
  const getValidationPath = useCallback((index: number, field: string) => {
    return index === 0 ? `text.${field}` : `text.textEntries.${index}.${field}`;
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
            {/* <TextField
              label="Text Color"
              value={entry.textColor}
              onChange={(value) => updateTextEntry(entry.id, 'textColor', value)}
              autoComplete="off"
              prefix="#"
              error={hasError(getValidationPath(index, 'textColor'))}
              helpText={hasError(getValidationPath(index, 'textColor')) ?
                getFieldErrorMessage(getValidationPath(index, 'textColor')) : undefined}
            /> */}
            <ColorPickerInput
  label="Text Color"
  value={entry.textColor ??"rgb(0, 0, 0)"}
  onChange={(newColor) =>updateTextEntry(entry.id, 'textColor', newColor)}
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
