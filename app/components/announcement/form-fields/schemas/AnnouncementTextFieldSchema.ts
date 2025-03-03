import { z } from "zod";

export const announcementTextFieldSchema = z.object({
  announcementText: z.string().min(1, "Campaign Message is required"),
  textColor: z.string(),
  fontSize: z.number().min(8).max(72),
  fontType: z.string(),
  fontUrl: z.string().optional(),
  languageCode: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.fontType !== 'site' && !data.fontUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Font URL is required for dynamic and custom fonts",
      path: ['fontUrl'],
    });
  }
  if (data.fontUrl && !data.fontUrl.startsWith('http')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Font URL must be a valid URL starting with http",
      path: ['fontUrl'],
    });
  }
});

export type AnnouncementTextFieldData = z.infer<typeof announcementTextFieldSchema>; 