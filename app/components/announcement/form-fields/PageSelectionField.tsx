import {
  Card,
  Text,
  BlockStack,
  Select,
  Tag,
  Box,
} from "@shopify/polaris";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { z } from "zod";

// Define schema for page selection
const pageSelectionSchema = z.object({
  selectedPages: z.array(z.string()).min(1, "At least one page must be selected").default(["__global"])
});

type PageSelectionData = z.infer<typeof pageSelectionSchema>;

interface PageSelectionFieldProps {
  pagesOptions: Array<{ label: string; value: string; }>;
  initialData?: Partial<PageSelectionData>;
  onDataChange: (data: PageSelectionData, isValid: boolean) => void;
  externalErrors?: Record<string, string>;
}

export function PageSelectionField({
  pagesOptions,
  initialData = {},
  onDataChange,
  externalErrors = {}
}: PageSelectionFieldProps) {
  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const hasCalledOnDataChange = useRef(false);
  
  const [formData, setFormData] = useState<PageSelectionData>(() => {
    return {
      selectedPages: initialData.selectedPages && initialData.selectedPages.length > 0 
        ? initialData.selectedPages 
        : ["__global"],
    };
  });

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    // Skip updates if hasCalledOnDataChange is already true (component already initialized)
    if (hasCalledOnDataChange.current) {
      return;
    }
    
    // Only update if we have significant initial data
    if (initialData.selectedPages && initialData.selectedPages.length > 0) {
      setFormData(prev => ({
        ...prev,
        selectedPages: initialData.selectedPages || prev.selectedPages,
      }));
    }
  }, [initialData]);

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Combine external and local errors
  const errors = useMemo(() => ({
    ...localErrors,
    ...externalErrors
  }), [localErrors, externalErrors]);

  /**
   * Validates the form data and sets error messages
   */
  const validateForm = useCallback(() => {
    try {
      pageSelectionSchema.parse(formData);
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

  const handlePagesChange = useCallback((value: string) => {
    if (!value || formData.selectedPages.includes(value)) return;
    
    // If adding __global, remove all other pages
    if (value === '__global') {
      setFormData({ selectedPages: ['__global'] });
      return;
    }
    
    // If adding a specific page, remove __global
    const newPages = formData.selectedPages
      .filter(page => page !== '__global')
      .concat(value);
      
    setFormData({ selectedPages: newPages });
  }, [formData.selectedPages]);

  const handlePagesRemove = useCallback((pageToRemove: string) => {
    // Don't allow removing the last page or __global if it's the only page
    if (formData.selectedPages.length === 1) {
      return;
    }
    
    const newPages = formData.selectedPages.filter(page => page !== pageToRemove);
    
    // If removing the last specific page, add __global
    if (newPages.length === 0) {
      setFormData({ selectedPages: ['__global'] });
      return;
    }
    
    setFormData({ selectedPages: newPages });
  }, [formData.selectedPages]);

  const hasError = useCallback((path: string) => {
    return !!errors[path];
  }, [errors]);

  const getFieldErrorMessage = useCallback((path: string) => {
    return errors[path] || '';
  }, [errors]);

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
              error={hasError('selectedPages')}
            />
            {hasError('selectedPages') && (
              <Text tone="critical" as="p">{getFieldErrorMessage('selectedPages')}</Text>
            )}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
              {formData.selectedPages.map((page) => {
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