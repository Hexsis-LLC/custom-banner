import { z } from "zod";

export const backgroundFieldSchema = z.object({
  backgroundType: z.enum(['solid', 'gradient']),
  color1: z.string(),
  color2: z.string(),
  gradientValue: z.string().optional(),
  pattern: z.enum(['none', 'stripe-green', 'stripe-blue']),
  padding: z.object({
    top: z.number().min(0, "Top padding must be at least 0"),
    right: z.number().min(0, "Right padding must be at least 0"),
    bottom: z.number().min(0, "Bottom padding must be at least 0"),
    left: z.number().min(0, "Left padding must be at least 0"),
  }),
}).superRefine((data, ctx) => {
  // For solid background type
  if (data.backgroundType === 'solid') {
    if (!data.color1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Background color is required for solid background",
        path: ['color1'],
      });
    }
  }
  
  // For gradient background type
  if (data.backgroundType === 'gradient') {
    if (!data.gradientValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Gradient value is required for gradient background",
        path: ['gradientValue'],
      });
    }
  }
});

export type BackgroundFieldData = z.infer<typeof backgroundFieldSchema>; 