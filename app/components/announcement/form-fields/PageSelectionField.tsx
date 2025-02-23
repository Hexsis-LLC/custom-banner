import {
  Card,
  Text,
  BlockStack,
  Select,
  Tag,
  Box,
} from "@shopify/polaris";
import { useFormContext } from "../../../contexts/AnnouncementFormContext";

interface PageSelectionFieldProps {
  pagesOptions: Array<{ label: string; value: string; }>;
}

export function PageSelectionField({ pagesOptions }: PageSelectionFieldProps) {
  const { formData, handleFormChange } = useFormContext();

  const handlePagesChange = (value: string) => {
    if (!value || formData.other.selectedPages.includes(value)) return;
    
    // If adding __global, remove all other pages
    if (value === '__global') {
      handleFormChange('other', { selectedPages: ['__global'] });
      return;
    }
    
    // If adding a specific page, remove __global
    const newPages = formData.other.selectedPages
      .filter(page => page !== '__global')
      .concat(value);
    handleFormChange('other', { selectedPages: newPages });
  };

  const handlePagesRemove = (pageToRemove: string) => {
    // Don't allow removing the last page or __global if it's the only page
    if (formData.other.selectedPages.length === 1) {
      return;
    }
    
    const newPages = formData.other.selectedPages.filter(page => page !== pageToRemove);
    
    // If removing the last specific page, add __global
    if (newPages.length === 0) {
      handleFormChange('other', { selectedPages: ['__global'] });
      return;
    }
    
    handleFormChange('other', { selectedPages: newPages });
  };

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <Text variant="headingMd" as="h6">Page Selection</Text>
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd">
              Appear on pages
            </Text>
            <Select
              label=""
              labelHidden
              options={pagesOptions}
              onChange={handlePagesChange}
              value=""
              placeholder="Select pages"
            />
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
              {formData.other.selectedPages.map((page) => {
                const label = pagesOptions.find((option) => option.value === page)?.label || page;
                return (
                  <Tag key={page} onRemove={() => handlePagesRemove(page)}>
                    {label}
                  </Tag>
                );
              })}
            </div>
          </BlockStack>
        </BlockStack>
      </Box>
    </Card>
  );
} 