import { TextField } from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import type { BasicSettings } from "../../../types/announcement";
import { FormError } from "../../../types/announcement-form";
import { useFormContext } from "../../../contexts/AnnouncementFormContext";

interface CampaignTitleFieldProps {
  initialData: BasicSettings;
  onDataChange: (data: BasicSettings, isValid: boolean) => void;
  externalErrors?: FormError[];
}

export function CampaignTitleField({
                                     initialData,
                                     onDataChange,
                                     externalErrors = [],
                                   }: CampaignTitleFieldProps) {
  const { fieldErrors } = useFormContext();
  const [formData, setFormData] = useState<BasicSettings>(() => initialData);
  const [errorMessages, setErrorMessages] = useState<string>("");

  const onCampaignTitleChange = useCallback(
    (value: string) => {
      setFormData((prev) => {
        const updatedData = { ...prev, campaignTitle: value };
        onDataChange(updatedData, true);
        return updatedData;
      });

      const fieldError = fieldErrors.errors.find(
        (err) => err.path.join(".") === "campaignTitle"
      );

      if (fieldError) {
        setErrorMessages(fieldError.message);
      } else {
        setErrorMessages(""); // Clear error if valid
      }
    },
    [onDataChange, fieldErrors]
  );

  useEffect(() => {
    const fieldError = fieldErrors.errors.find(
      (err) => err.path.join(".") === "campaignTitle"
    );

    if (fieldError) {
      setErrorMessages(fieldError.message);
      return;
    }

    const externalError = externalErrors.find((err) =>
      err.path.includes("campaignTitle")
    );

    if (externalError) {
      setErrorMessages(externalError.message);
    } else {
      setErrorMessages("");
    }
  }, [fieldErrors, externalErrors]);

  return (
    <TextField
      label="Campaign Title"
      autoComplete="off"
      placeholder="Value"
      value={formData.campaignTitle}
      onChange={onCampaignTitleChange}
      error={errorMessages}
    />
  );
}
