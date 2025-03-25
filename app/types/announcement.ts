import { z } from "zod";

// Announcement Type Enum
export const EAnnouncementTypeSchema = z.enum([
  "basic",
  "countdown",
  "email_signup",
  "multi_text",
]);
export type EAnnouncementType = z.infer<typeof EAnnouncementTypeSchema>;

// Create a constant object to use as values
export const ANNOUNCEMENT_TYPE = {
  BASIC: "basic" as const,
  COUNTDOWN: "countdown" as const,
  EMAIL_SIGNUP: "email_signup" as const,
  MULTI_TEXT: "multi_text" as const,
} as const;

// Announcement Tabs Enum
export const EAnnouncementTabsSchema = z.enum([
  "basic",
  "announcement-text",
  "countdown",
  "cta",
  "background",
  "other",
]);

export type EAnnouncementTabs = z.infer<typeof EAnnouncementTabsSchema>;

// Create a constant object to use as values
export const ANNOUNCEMENT_TABS = {
  BASIC: "basic" as const,
  ANNOUNCEMENT_TEXT: "announcement-text" as const,
  COUNTDOWN: "countdown" as const,
  CTA: "cta" as const,
  BACKGROUND: "background" as const,
  OTHER: "other" as const,
} as const;

// Font Type Enum
export const EFontTypeSchema = z.enum(["site", "custom", "dynamic"]);
export type EFontType = z.infer<typeof EFontTypeSchema>;
