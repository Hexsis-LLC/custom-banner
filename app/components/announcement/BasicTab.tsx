import {
  BlockStack,
  Box,
  Card,
} from "@shopify/polaris";
import { useFormContext } from "../../contexts/AnnouncementFormContext";
import { CampaignTitleField } from "./form-fields/CampaignTitleField";
import { useCallback, useMemo } from "react";
import {BannerSizeField} from "./form-fields/BannerSizeField";
import {ScheduleCampaignField} from "./form-fields/ScheduleCampaignField";

export function BasicTab() {
  const { formData, handleFormChange,validationErrors,validateForm } = useFormContext();

  // Format the context data for the CampaignTitleField component
  const initialData = useMemo(() => {
    return formData.basic;
  }, [formData.basic]);


  // Handle data changes from the BannerSizeField component
  const handleBannerChange = useCallback((data: any, isValid: boolean) => {
    if (!isValid) return;

    handleFormChange('basic', {
      campaignTitle: data.campaignTitle,
      size: data.size,
      sizeHeight: data.sizeHeight,
      sizeWidth: data.sizeWidth,
      startType: data.startType,
      endType: data.endType,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
    });
  }, [handleFormChange]);

  return (
    <BlockStack gap="300">
      <Card roundedAbove="sm">
        <Box padding="400">
          <CampaignTitleField
            initialData={initialData}
            onDataChange={(data, isValid) => {
              validateForm()
              handleBannerChange(data, isValid);
            }}
            externalErrors={validationErrors}
          />
        </Box>
      </Card>

      <BannerSizeField
        initialData={initialData}
        onDataChange={handleBannerChange}
        externalErrors={validationErrors}
      />

      <ScheduleCampaignField
        initialData={initialData}
        onDataChange={data => {
          console.log(data)
          handleBannerChange(data, true);
        }}
        externalErrors={validationErrors}
      />
    </BlockStack>
  );
}
