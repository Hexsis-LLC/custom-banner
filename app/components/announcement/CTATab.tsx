import { BlockStack } from "@shopify/polaris";
import { CTAButtonField } from "./form-fields/CTAButtonField";
import { useFormContext } from "../../contexts/AnnouncementFormContext";
import { useMemo, useCallback } from "react";
import type { CTAButtonFieldData } from "../../schemas/schemas/CTAButtonFieldSchema";

export function CTATab() {
  const { formData, handleFormChange } = useFormContext();
  
  // Format the context data for the CTA button field component
  const initialCtaData = useMemo(() => {
    return {
      ctaType: formData.cta.ctaType || 'none',
      padding: formData.cta.padding,
      fontType: formData.cta.fontType,
      fontUrl: formData.cta.fontUrl,
      buttonFontColor: formData.cta.buttonFontColor,
      buttonBackgroundColor: formData.cta.buttonBackgroundColor,
      ctaText: formData.cta.ctaText,
      ctaLink: formData.cta.ctaLink,
      textColor: formData.cta.textColor,
    };
  }, [formData.cta]);

  // Handle data changes from the CTA button field component
  const handleCtaDataChange = useCallback((data: CTAButtonFieldData, isValid: boolean) => {
    // Update the form context with the new data
    handleFormChange('cta', {
      ctaType: data.ctaType,
      padding: data.padding,
      fontType: data.fontType,
      fontUrl: data.fontUrl,
      buttonFontColor: data.buttonFontColor,
      buttonBackgroundColor: data.buttonBackgroundColor,
      ctaText: data.ctaText,
      ctaLink: data.ctaLink,
      // Add textColor only if it's a link type
      ...(data.ctaType === 'link' ? { textColor: (data as any).textColor } : {}),
    });
  }, [handleFormChange]);

  return (
    <BlockStack gap="400">
      <CTAButtonField 
        initialData={initialCtaData}
        onDataChange={handleCtaDataChange}
        externalErrors={{}}
      />
    </BlockStack>
  );
}
