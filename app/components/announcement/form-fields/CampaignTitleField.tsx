import { TextField } from "@shopify/polaris";
import { useCallback, useState, useEffect, useRef } from "react";
import { z } from "zod";

// Define schema for campaign title
const campaignTitleSchema = z.object({
  campaignTitle: z.string().min(1, "Campaign title is required"),
});

type CampaignTitleData = z.infer<typeof campaignTitleSchema>;

interface CampaignTitleFieldProps {
  initialData?: Partial<CampaignTitleData>;
  onDataChange: (data: CampaignTitleData, isValid: boolean) => void;
  externalErrors?: Record<string, string>;
}

export function CampaignTitleField({
  initialData = {},
  onDataChange,
  externalErrors = {}
}: CampaignTitleFieldProps) {
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const hasCalledOnDataChange = useRef(false);
  
  const [formData, setFormData] = useState<CampaignTitleData>(() => {
    return {
      campaignTitle: initialData.campaignTitle || '',
    };
  });

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    // Skip updates if hasCalledOnDataChange is already true (component already initialized)
    if (hasCalledOnDataChange.current) {
      return;
    }
    
    // Only update if we have significant initial data
    if (initialData.campaignTitle) {
      setFormData(prev => ({
        ...prev,
        campaignTitle: initialData.campaignTitle || prev.campaignTitle,
      }));
    }
  }, [initialData]);

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Combine external and local errors
  const errors = useCallback(() => ({
    ...localErrors,
    ...externalErrors
  }), [localErrors, externalErrors])();

  /**
   * Validates the form data and sets error messages
   */
  const validateForm = useCallback(() => {
    try {
      campaignTitleSchema.parse(formData);
      setLocalErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        
        setLocalErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  // Run validation when external errors change
  useEffect(() => {
    validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalErrors]);

  // Validate and notify parent when form data changes
  useEffect(() => {
    // Skip the first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Immediately validate on mount but don't call onDataChange
      validateForm();
      hasCalledOnDataChange.current = true;
      return;
    }
    
    // For subsequent updates, validate and notify parent
    const isValid = validateForm();
    
    // Prevent recursive updates by ensuring we don't notify parent with the same data
    if (hasCalledOnDataChange.current) {
      onDataChange(formData, isValid);
    } else {
      hasCalledOnDataChange.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const onCampaignTitleChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      campaignTitle: value
    }));
  }, []);

  return (
    <TextField
      label="Campaign Title"
      autoComplete="off"
      placeholder="Value"
      value={formData.campaignTitle}
      onChange={onCampaignTitleChange}
      error={!!errors.campaignTitle}
      helpText={errors.campaignTitle}
    />
  );
} 