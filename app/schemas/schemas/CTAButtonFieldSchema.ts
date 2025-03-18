import { z } from "zod";

export const ctaButtonFieldSchema = z.discriminatedUnion('ctaType', [
  // None type - no additional fields required
  z.object({
    ctaType: z.literal('none'),
    padding: z.object({
      top: z.number(),
      right: z.number(),
      bottom: z.number(),
      left: z.number(),
    }),
    fontType: z.string(),
    fontUrl: z.string().optional(),
    buttonFontColor: z.string().optional(),
    buttonBackgroundColor: z.string().optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
  }),
  // Regular button type
  z.object({
    ctaType: z.literal('regular'),
    ctaText: z.string().min(1, "Button text is required"),
    ctaLink: z.string().url("Please enter a valid URL"),
    padding: z.object({
      top: z.number().min(0, "Top padding cannot be negative"),
      right: z.number().min(0, "Right padding cannot be negative"),
      bottom: z.number().min(0, "Bottom padding cannot be negative"),
      left: z.number().min(0, "Left padding cannot be negative"),
    }),
    fontType: z.string(),
    fontUrl: z.string().optional(),
    buttonFontColor: z.string().min(1, "Button text color is required"),
    buttonBackgroundColor: z.string().min(1, "Button background color is required"),
  }),
  // Link type
  z.object({
    ctaType: z.literal('link'),
    ctaText: z.string().min(1, "Link text is required"),
    ctaLink: z.string().url("Please enter a valid URL"),
    textColor: z.string().min(1, "Link text color is required"),
    padding: z.object({
      top: z.number(),
      right: z.number(),
      bottom: z.number(),
      left: z.number(),
    }),
    fontType: z.string(),
    fontUrl: z.string().optional(),
    buttonFontColor: z.string().optional(),
    buttonBackgroundColor: z.string().optional(),
  }),
  // Bar type
  z.object({
    ctaType: z.literal('bar'),
    ctaLink: z.string().url("Please enter a valid URL"),
    padding: z.object({
      top: z.number(),
      right: z.number(),
      bottom: z.number(),
      left: z.number(),
    }),
    fontType: z.string(),
    fontUrl: z.string().optional(),
    buttonFontColor: z.string().optional(),
    buttonBackgroundColor: z.string().optional(),
    ctaText: z.string().optional(),
  }),
]).superRefine((data, ctx) => {
  // Only require font URL for custom fonts
  if (data.fontType === 'custom' && !data.fontUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Font URL is required for custom fonts",
      path: ['fontUrl'],
    });
  }
  // Validate URL format if provided
  if (data.fontUrl && !data.fontUrl.startsWith('http')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Font URL must be a valid URL starting with http",
      path: ['fontUrl'],
    });
  }
});

export type CTAButtonFieldData = z.infer<typeof ctaButtonFieldSchema>; 