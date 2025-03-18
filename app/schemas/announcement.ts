import { z } from "zod";
import type { AnnouncementBannerData } from "../types/announcement";
import { basicInfoFieldSchema } from "./schemas/BasicInfoFieldSchema";
import { announcementTextFieldSchema } from "./schemas/AnnouncementTextFieldSchema";
import { ctaButtonFieldSchema } from "./schemas/CTAButtonFieldSchema";
import { backgroundFieldSchema } from "./schemas/BackgroundFieldSchema";
import { otherFieldSchema } from "./schemas/OtherFieldSchema";
import { countdownFieldSchema } from "./schemas/CountdownFieldSchema";

// Base announcement schema
export const announcementSchema = z.object({
  basic: basicInfoFieldSchema,
  text: announcementTextFieldSchema,
  cta: ctaButtonFieldSchema,
  background: backgroundFieldSchema,
  other: otherFieldSchema,
  countdown: countdownFieldSchema.optional()
});

// Type for form data
export type AnnouncementFormData = z.infer<typeof announcementSchema>;

export function validateAnnouncement(data: unknown): AnnouncementBannerData {
  const validated = announcementSchema.parse(data);

  // Ensure selectedPages is __global when empty
  if (validated.other.selectedPages.length === 0) {
    validated.other.selectedPages = ["__global"];
  }

  return validated as AnnouncementBannerData;
}
