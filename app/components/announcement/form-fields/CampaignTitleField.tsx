import { TextField } from "@shopify/polaris";
import { useFormContext } from "../../../contexts/AnnouncementFormContext";

export function CampaignTitleField() {
  const { formData, handleFormChange, hasError, getFieldErrorMessage } = useFormContext();
  
  const onCampaignTitleChange = (value: string) => {
    handleFormChange('basic', { campaignTitle: value });
  };

  return (
    <TextField
      label="Campaign Title"
      autoComplete="off"
      placeholder="Value"
      value={formData.basic.campaignTitle}
      onChange={onCampaignTitleChange}
      error={hasError('basic.campaignTitle')}
      helpText={hasError('basic.campaignTitle') ? getFieldErrorMessage('basic.campaignTitle') : undefined}
    />
  );
} 