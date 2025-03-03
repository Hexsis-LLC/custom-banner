import { z } from "zod";

export const backgroundFieldSchema = z.object({
  backgroundType: z.enum(['solid', 'gradient']),
  color1: z.string().min(1, "Background color is required"),
  color2: z.string(),
  pattern: z.enum(['none', 'stripe-green', 'stripe-blue']),
  padding: z.object({
    top: z.number().min(0, "Top padding must be at least 0"),
    right: z.number().min(0, "Right padding must be at least 0"),
    bottom: z.number().min(0, "Bottom padding must be at least 0"),
    left: z.number().min(0, "Left padding must be at least 0"),
  }),
}).superRefine((data, ctx) => {
  if (data.backgroundType === 'gradient' && !data.color2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Second color is required for gradient background",
      path: ['color2'],
    });
  }
});

export type BackgroundFieldData = z.infer<typeof backgroundFieldSchema>; 