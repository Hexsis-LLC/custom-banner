import { z } from "zod";

export const basicInfoFieldSchema = z.object({
  size: z.enum(['large', 'mid', 'small', 'custom']),
  sizeHeight: z.string(),
  sizeWidth: z.string(),
  campaignTitle: z.string().min(1, "Campaign title is required"),
  status: z.enum(['draft', 'published', 'paused', 'ended']).default('draft'),
  type: z.literal('basic'),
  isActive: z.boolean().default(true),
  closeButtonPosition: z.enum(['right', 'left', 'center', 'none']).default('right'),
  startType: z.enum(['now', 'specific']),
  endType: z.enum(['until_stop', 'specific']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  startTime: z.string(),
  endTime: z.string(),
  showCloseButton: z.boolean().optional(),
  countdownEndTime: z.string().optional(),
  timezone: z.string().optional(),
  heightPx: z.number().optional(),
  widthPercent: z.number().optional(),
}).superRefine((data, ctx) => {
  if (data.size === 'custom') {
    // Validate height
    if (!data.sizeHeight || data.sizeHeight.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Height is required for custom size",
        path: ['sizeHeight'],
      });
    } else if (isNaN(Number(data.sizeHeight)) || Number(data.sizeHeight) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Height must be a positive number",
        path: ['sizeHeight'],
      });
    }

    // Validate width
    if (!data.sizeWidth || data.sizeWidth.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Width is required for custom size",
        path: ['sizeWidth'],
      });
    } else {
      const width = Number(data.sizeWidth);
      if (isNaN(width) || width <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Width must be a positive number",
          path: ['sizeWidth'],
        });
      } else if (width > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Width cannot be more than 100%",
          path: ['sizeWidth'],
        });
      }
    }
  }
});

export type BasicInfoFieldData = z.infer<typeof basicInfoFieldSchema>; 