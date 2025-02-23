import {
  TextField,
  Icon,
  Text,
  BlockStack,
  InlineStack,
  RangeSlider,
  Card,
  Box,
} from "@shopify/polaris";
import { FontSection } from "./fontSection";
import { AnnouncementTextField } from "./form-fields/AnnouncementTextField";
import { useFormContext } from "../../contexts/AnnouncementFormContext";

interface AnnouncementTextTabProps {
  fontType: string;
  fontSize: number;
  announcementText: string;
  textColor: string;
  fontUrl?: string;
  hasError: (fieldPath: string) => boolean;
  getFieldErrorMessage: (fieldPath: string) => string;
  onAnnouncementTextChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  onFontTypeChange: (value: string) => void;
  onFontSizeChange: (value: number) => void;
  onFontUrlChange: (value: string) => void;
}

export function AnnouncementTextTab() {
  const { formData } = useFormContext();
  const isMultiText = formData.basic.type === 'multi_text';

  return (
    <BlockStack gap="400">
      <AnnouncementTextField isMultiText={isMultiText} />
      {/* Future fields can be added here */}
      {isMultiText && (
        // Additional fields for multi-text type can be added here
        <></>
      )}
    </BlockStack>
  );
}
