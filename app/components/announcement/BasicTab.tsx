import {
  BlockStack,
  Box,
  Card,
} from "@shopify/polaris";
import { useFormContext } from "../../contexts/AnnouncementFormContext";
import { CampaignTitleField } from "./form-fields/CampaignTitleField";
import { BannerSizeField } from "./form-fields/BannerSizeField";
import { ScheduleCampaignField } from "./form-fields/ScheduleCampaignField";
import { useCallback, useMemo } from "react";
import type { BasicInfoFieldData } from "../../schemas/schemas/BasicInfoFieldSchema";

export function BasicTab() {
  const { formData, handleFormChange } = useFormContext();

  // Format the context data for the CampaignTitleField component
  const campaignTitleData = useMemo(() => {
    return {
      campaignTitle: formData.basic.campaignTitle || '',
    };
  }, [formData.basic.campaignTitle]);

  // Format the context data for the BannerSizeField component
  const bannerSizeData = useMemo(() => {
    return {
      size: formData.basic.size || 'mid',
      sizeHeight: formData.basic.sizeHeight || '',
      sizeWidth: formData.basic.sizeWidth || '',
    };
  }, [formData.basic.size, formData.basic.sizeHeight, formData.basic.sizeWidth]);

  // Format the context data for the ScheduleCampaignField component
  const scheduleCampaignData = useMemo(() => {
    return {
      startType: formData.basic.startType || 'now',
      endType: formData.basic.endType || 'until_stop',
      startDate: formData.basic.startDate?.toString() || '',
      endDate: formData.basic.endDate?.toString() || '',
      startTime: formData.basic.startTime || '',
      endTime: formData.basic.endTime || '',
    };
  }, [
    formData.basic.startType, 
    formData.basic.endType, 
    formData.basic.startDate, 
    formData.basic.endDate, 
    formData.basic.startTime, 
    formData.basic.endTime
  ]);

  // Handle data changes from the CampaignTitleField component
  const handleCampaignTitleChange = useCallback((data: any, isValid: boolean) => {
    if (!isValid) return;
    
    handleFormChange('basic', {
      campaignTitle: data.campaignTitle,
    });
  }, [handleFormChange]);

  // Handle data changes from the BannerSizeField component
  const handleBannerSizeChange = useCallback((data: any, isValid: boolean) => {
    if (!isValid) return;
    
    handleFormChange('basic', {
      size: data.size,
      sizeHeight: data.sizeHeight,
      sizeWidth: data.sizeWidth,
    });
  }, [handleFormChange]);

  // Handle data changes from the ScheduleCampaignField component
  const handleScheduleChange = useCallback((data: any, isValid: boolean) => {
    if (!isValid) return;
    
    handleFormChange('basic', {
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
            initialData={campaignTitleData}
            onDataChange={handleCampaignTitleChange}
            externalErrors={{}}
          />
        </Box>
      </Card>

      <BannerSizeField 
        initialData={bannerSizeData}
        onDataChange={handleBannerSizeChange}
        externalErrors={{}}
      />
      
      <ScheduleCampaignField 
        initialData={scheduleCampaignData}
        onDataChange={handleScheduleChange}
        externalErrors={{}}
      />
    </BlockStack>
  );
}
