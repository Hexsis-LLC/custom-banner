import {
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  RangeSlider,
  Box,
  Button,
} from "@shopify/polaris";
import { useFormContext } from "../../../contexts/AnnouncementFormContext";
import { FontSection } from "../fontSection";
import { PlusIcon, DeleteIcon } from "@shopify/polaris-icons";
import type { TextEntry } from "../../../types/announcement";

interface AnnouncementTextFieldProps {
  isMultiText: boolean;
}

export function AnnouncementTextField({ isMultiText }: AnnouncementTextFieldProps) {
  const { formData, handleFormChange, hasError, getFieldErrorMessage } = useFormContext();

  // Convert existing single text to entries format if needed
  const textEntries: TextEntry[] = formData.text.textEntries || [{
    id: '1',
    announcementText: formData.text.announcementText,
    textColor: formData.text.textColor,
    fontSize: formData.text.fontSize,
    fontType: formData.text.fontType,
    fontUrl: formData.text.fontUrl,
    languageCode: formData.text.languageCode || '',
  }];

  const addNewText = () => {
    const newEntry: TextEntry = {
      id: Date.now().toString(),
      announcementText: '',
      textColor: formData.text.textColor,
      fontSize: formData.text.fontSize,
      fontType: formData.text.fontType,
      fontUrl: formData.text.fontUrl,
      languageCode: '',
    };

    const updatedEntries = [...textEntries, newEntry];
    handleFormChange('text', {
      ...formData.text,
      textEntries: updatedEntries,
      // Keep the main fields in sync with the first entry
      announcementText: textEntries[0].announcementText,
      textColor: textEntries[0].textColor,
      fontSize: textEntries[0].fontSize,
      fontType: textEntries[0].fontType,
      fontUrl: textEntries[0].fontUrl,
      languageCode: textEntries[0].languageCode,
    });
  };

  const removeText = (id: string) => {
    if (textEntries.length === 1) return; // Don't remove the last entry
    const updatedEntries = textEntries.filter(entry => entry.id !== id);
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
  };

  const updateTextEntry = (id: string, field: keyof TextEntry, value: string | number) => {
    const updatedEntries = textEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    );

    const updates = {
      ...formData.text,
      textEntries: updatedEntries,
    };

    // Always update the main fields for the first entry
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
        (updates as any)[mainField] = value;
      }
    }

    handleFormChange('text', updates);
  };

  // Helper function to get validation path based on multi-text mode
  const getValidationPath = (index: number, field: string) => {
    if (index === 0) {
      // First entry always validates against main fields
      return `text.${field}`;
    }
    // Additional entries validate against textEntries array
    return `text.textEntries.${index}.${field}`;
  };

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
                disabled={textEntries.length >= 5}
              >
                Add Text
              </Button>
            )}
          </InlineStack>

          {textEntries.map((entry, index) => (
            <BlockStack key={entry.id} gap="400">
              {/* Text Entry Section */}
              <InlineStack align="start" gap="200">
                <div style={{ flex: 1 }}>
                  <TextField
                    label={`Text Message ${isMultiText && textEntries.length > 1 ? index + 1 : ''}`}
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
                {isMultiText && textEntries.length > 1 && (
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
                  <TextField
                    label="Text Color"
                    value={entry.textColor}
                    onChange={(value) => updateTextEntry(entry.id, 'textColor', value)}
                    autoComplete="off"
                    prefix="#"
                    error={hasError(getValidationPath(index, 'textColor'))}
                    helpText={hasError(getValidationPath(index, 'textColor')) ? 
                      getFieldErrorMessage(getValidationPath(index, 'textColor')) : undefined}
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
                      min={12}
                      max={32}
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

              {isMultiText && index < textEntries.length - 1 && (
                <div style={{ borderBottom: '1px solid #ddd', margin: '16px 0' }} />
              )}
            </BlockStack>
          ))}
        </BlockStack>
      </Box>
    </Card>
  );
} 