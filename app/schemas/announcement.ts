import { z } from "zod";
import type { AnnouncementBannerData } from "../types/announcement";
import { basicInfoFieldSchema } from "../components/announcement/form-fields/schemas/BasicInfoFieldSchema";
import { announcementTextFieldSchema } from "../components/announcement/form-fields/schemas/AnnouncementTextFieldSchema";
import { ctaButtonFieldSchema } from "../components/announcement/form-fields/schemas/CTAButtonFieldSchema";
import { backgroundFieldSchema } from "../components/announcement/form-fields/schemas/BackgroundFieldSchema";
import { otherFieldSchema } from "../components/announcement/form-fields/schemas/OtherFieldSchema";

export const announcementSchema = z.object({
  basic: basicInfoFieldSchema,
  text: announcementTextFieldSchema,
  cta: ctaButtonFieldSchema,
  background: backgroundFieldSchema,
  other: otherFieldSchema,
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;

export function validateAnnouncement(data: unknown): AnnouncementBannerData {
  const validated = announcementSchema.parse(data);
  
  // Ensure selectedPages is __global when empty
  if (validated.other.selectedPages.length === 0) {
    validated.other.selectedPages = ["__global"];
  }
  
  return validated as AnnouncementBannerData;
}
