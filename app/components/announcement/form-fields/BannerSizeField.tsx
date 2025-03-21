import {
  Card,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  RadioButton,
  Box,
} from "@shopify/polaris";
import { useCallback, useState, useEffect } from "react";
import type { BasicSettings } from "../../../types/announcement";
import { FormError } from "../../../types/announcement-form";

interface BannerSizeFieldProps {
  initialData: BasicSettings;
  onDataChange: (data: BasicSettings, isValid: boolean) => void;
  externalErrors?: FormError[];
}

export function BannerSizeField({
                                  initialData,
                                  onDataChange,
                                  externalErrors = [],
                                }: BannerSizeFieldProps) {
  const [formData, setFormData] = useState<BasicSettings>(initialData);

  // Store errors as a dictionary for efficient lookup
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onChangeHandler = useCallback(
    (value: Partial<BasicSettings>) => {
      setFormData((prev) => {
        const updatedData = { ...prev, ...value };
        onDataChange(updatedData, true);

        // Perform on-change validation
        const newErrors: Record<string, string> = { ...errors };

        if (updatedData.size === "custom") {
          if (!updatedData.sizeHeight || Number(updatedData.sizeHeight) <= 0) {
            newErrors.sizeHeight = "Height must be greater than 0.";
          } else {
            delete newErrors.sizeHeight;
          }

          if (!updatedData.sizeWidth || Number(updatedData.sizeWidth) <= 0) {
            newErrors.sizeWidth = "Width must be greater than 0.";
          } else {
            delete newErrors.sizeWidth;
          }
        } else {
          // If not "custom", remove any existing size-related errors
          delete newErrors.sizeHeight;
          delete newErrors.sizeWidth;
        }

        setErrors(newErrors);

        return updatedData;
      });
    },
    [onDataChange, errors]
  );

  useEffect(() => {
    // Merge external errors
    const newErrors: Record<string, string> = {};

    externalErrors?.forEach((error) => {
      error.path.forEach((field) => {
        if (field === "sizeHeight" || field === "sizeWidth") {
          newErrors[field] = error.message;
        }
      });
    });

    setErrors(newErrors);
  }, [externalErrors]);

  return (
    <Card roundedAbove="sm">
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack align="start" gap="200">
            <Text variant="headingMd" as="h6">
              Size
            </Text>
            <Icon source="help" />
          </InlineStack>

          <InlineStack gap="300">
            <RadioButton
              label="Small"
              checked={formData.size === "small"}
              id="small"
              name="size"
              onChange={() => onChangeHandler({ size: "small" })}
            />
            <RadioButton
              label="Medium"
              checked={formData.size === "mid"}
              id="mid"
              name="size"
              onChange={() => onChangeHandler({ size: "mid" })}
            />
            <RadioButton
              label="Large"
              checked={formData.size === "large"}
              id="large"
              name="size"
              onChange={() => onChangeHandler({ size: "large" })}
            />
            <RadioButton
              label="Custom"
              checked={formData.size === "custom"}
              id="custom"
              name="size"
              onChange={() => onChangeHandler({ size: "custom" })}
            />
          </InlineStack>

          <InlineStack gap="400" align="space-between">
            <div style={{ width: "49%" }}>
              <TextField
                label="Height"
                type="number"
                value={formData.sizeHeight}
                onChange={(value) => onChangeHandler({ sizeHeight: value })}
                suffix="px"
                autoComplete="off"
                disabled={formData.size !== "custom"}
                error={errors.sizeHeight}
              />
            </div>
            <div style={{ width: "49%" }}>
              <TextField
                label="Width"
                type="number"
                value={formData.sizeWidth}
                suffix="%"
                onChange={(value) => onChangeHandler({ sizeWidth: value })}
                autoComplete="off"
                disabled={formData.size !== "custom"}
                error={errors.sizeWidth}
              />
            </div>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}
