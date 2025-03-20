import { BlockStack } from "@shopify/polaris";
import { useCallback, useMemo } from "react";
import { useFormContext } from "../../contexts/AnnouncementFormContext";
import { CloseButtonField } from "./form-fields/CloseButtonField";
import { DisplayBehaviorField } from "./form-fields/DisplayBehaviorField";
import { PageSelectionField } from "./form-fields/PageSelectionField";

interface OtherTabProps {
  pagesOptions: Array<{ label: string; value: string; }>;
}

export function OtherTab({ pagesOptions }: OtherTabProps) {
  const { formData, handleFormChange, fieldErrors } = useFormContext();

  // Format data for CloseButtonField
  const closeButtonData = useMemo(() => ({
    showCloseButton: formData.basic.showCloseButton,
    closeButtonPosition: formData.basic.closeButtonPosition,
    closeButtonColor: formData.basic.closeButtonColor,
  }), [formData.basic]);

  // Format data for DisplayBehaviorField
  const displayBehaviorData = useMemo(() => ({
    displayBeforeDelay: formData.other.displayBeforeDelay,
    showAfterClosing: formData.other.showAfterClosing,
    showAfterCTA: formData.other.showAfterCTA,
  }), [formData.other]);

  // Format data for PageSelectionField
  const pageSelectionData = useMemo(() => ({
    selectedPages: formData.other.selectedPages,
  }), [formData.other.selectedPages]);

  // Extract errors for each field
  const closeButtonErrors = useMemo(() => {
    if (!fieldErrors || !fieldErrors.errors) return {};
    
    return fieldErrors.errors
      .filter(err => {
        const path = err.path.join('.');
        return path.startsWith('basic.showCloseButton') || 
               path.startsWith('basic.closeButtonPosition') || 
               path.startsWith('basic.closeButtonColor');
      })
      .reduce((acc: Record<string, string>, err) => {
        const path = err.path.join('.');
        const fieldName = path.split('.')[1]; // Extract field name without the section prefix
        acc[fieldName] = err.message;
        return acc;
      }, {});
  }, [fieldErrors]);

  const displayBehaviorErrors = useMemo(() => {
    if (!fieldErrors || !fieldErrors.errors) return {};
    
    return fieldErrors.errors
      .filter(err => {
        const path = err.path.join('.');
        return path.startsWith('other.displayBeforeDelay') || 
               path.startsWith('other.showAfterClosing') || 
               path.startsWith('other.showAfterCTA');
      })
      .reduce((acc: Record<string, string>, err) => {
        const path = err.path.join('.');
        const fieldName = path.split('.')[1]; // Extract field name without the section prefix
        acc[fieldName] = err.message;
        return acc;
      }, {});
  }, [fieldErrors]);

  const pageSelectionErrors = useMemo(() => {
    if (!fieldErrors || !fieldErrors.errors) return {};
    
    return fieldErrors.errors
      .filter(err => {
        const path = err.path.join('.');
        return path.startsWith('other.selectedPages');
      })
      .reduce((acc: Record<string, string>, err) => {
        const path = err.path.join('.');
        const fieldName = path.split('.')[1]; // Extract field name without the section prefix
        acc[fieldName] = err.message;
        return acc;
      }, {});
  }, [fieldErrors]);

  // Handler for CloseButtonField data changes
  const handleCloseButtonChange = useCallback((data: any, isValid: boolean) => {
    if (isValid) {
      handleFormChange('basic', data);
    }
  }, [handleFormChange]);

  // Handler for DisplayBehaviorField data changes
  const handleDisplayBehaviorChange = useCallback((data: any, isValid: boolean) => {
    if (isValid) {
      handleFormChange('other', data);
    }
  }, [handleFormChange]);

  // Handler for PageSelectionField data changes
  const handlePageSelectionChange = useCallback((data: any, isValid: boolean) => {
    if (isValid) {
      handleFormChange('other', data);
    }
  }, [handleFormChange]);

  return (
    <BlockStack gap="400">
      <CloseButtonField 
        initialData={closeButtonData}
        onDataChange={handleCloseButtonChange}
        externalErrors={closeButtonErrors}
      />
      <DisplayBehaviorField 
        initialData={displayBehaviorData}
        onDataChange={handleDisplayBehaviorChange}
        externalErrors={displayBehaviorErrors}
      />
      <PageSelectionField 
        pagesOptions={pagesOptions}
        initialData={pageSelectionData}
        onDataChange={handlePageSelectionChange}
        externalErrors={pageSelectionErrors}
      />
    </BlockStack>
  );
}
