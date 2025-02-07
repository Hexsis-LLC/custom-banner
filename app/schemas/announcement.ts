import { z } from "zod";
import type { AnnouncementBannerData } from "../types/announcement";

const basicSchema = z.object({
  size: z.enum(['large', 'medium', 'small', 'custom']),
  sizeHeight: z.string(),
  sizeWidth: z.string(),
  campaignTitle: z.string().min(1, "Campaign title is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  startTime: z.string(),
  endTime: z.string(),
});

const textSchema = z.object({
  announcementText: z.string().min(1, "Campaign Message is required"),
  textColor: z.string(),
  fontSize: z.number().min(8).max(72),
  fontType: z.string(),
});

// Define CTA schema based on type
const ctaSchema = z.discriminatedUnion('ctaType', [
  // None type - no additional fields required
  z.object({
    ctaType: z.literal('none'),
    padding: z.object({
      top: z.number().min(0),
      right: z.number().min(0),
      bottom: z.number().min(0),
      left: z.number().min(0),
    }),
    fontType: z.string(),
    buttonFontColor: z.string().optional(),
    buttonBackgroundColor: z.string().optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
  }),
  // Clickable link type - requires text and link
  z.object({
    ctaType: z.literal('link'),
    ctaText: z.string().min(1, "CTA text is required for link type"),
    ctaLink: z.string().url("Please enter a valid URL"),
    padding: z.object({
      top: z.number().min(0),
      right: z.number().min(0),
      bottom: z.number().min(0),
      left: z.number().min(0),
    }),
    fontType: z.string(),
    buttonFontColor: z.string().optional(),
    buttonBackgroundColor: z.string().optional(),
  }),
  // Clickable bar type - requires only link
  z.object({
    ctaType: z.literal('bar'),
    ctaLink: z.string().url("Please enter a valid URL"),
    padding: z.object({
      top: z.number().min(0),
      right: z.number().min(0),
      bottom: z.number().min(0),
      left: z.number().min(0),
    }),
    fontType: z.string(),
    buttonFontColor: z.string().optional(),
    buttonBackgroundColor: z.string().optional(),
    ctaText: z.string().optional(),
  }),
  // Regular button type - requires all fields
  z.object({
    ctaType: z.literal('regular'),
    ctaText: z.string().min(1, "CTA text is required for button type"),
    ctaLink: z.string().url("Please enter a valid URL"),
    padding: z.object({
      top: z.number().min(0),
      right: z.number().min(0),
      bottom: z.number().min(0),
      left: z.number().min(0),
    }),
    fontType: z.string(),
    buttonFontColor: z.string(),
    buttonBackgroundColor: z.string(),
  }),
]);

const backgroundSchema = z.object({
  backgroundType: z.string(),
  color1: z.string(),
  color2: z.string(),
  color3: z.string(),
  pattern: z.string(),
  paddingRight: z.number().min(0),
});

const otherSchema = z.object({
  closeButtonPosition: z.enum(['right', 'left']),
  displayBeforeDelay: z.string(),
  showAfterClosing: z.string(),
  showAfterCTA: z.string(),
  selectedPages: z.array(z.string()),
  campaignTiming: z.string(),
});

export const announcementSchema = z.object({
  basic: basicSchema,
  text: textSchema,
  cta: ctaSchema,
  background: backgroundSchema,
  other: otherSchema,
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;

export function validateAnnouncement(data: unknown): AnnouncementBannerData {
  return announcementSchema.parse(data) as AnnouncementBannerData;
}
