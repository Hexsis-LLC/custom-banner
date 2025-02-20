import { z } from "zod";
import type { AnnouncementBannerData } from "../types/announcement";

const basicInfoSchema = z.object({
  size: z.enum(['large', 'medium', 'small', 'custom']),
  sizeHeight: z.string(),
  sizeWidth: z.string(),
  campaignTitle: z.string().min(1, "Campaign title is required"),
  status: z.enum(['draft', 'published']).default('draft'),
  type: z.literal('basic'),
  isActive: z.boolean().default(true),
  closeButtonPosition: z.enum(['right', 'left', 'center']).default('right'),
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

// Common fields for all schedule types
const baseScheduleFields = {
  startType: z.enum(['now', 'specific']),
  endType: z.enum(['until_stop', 'specific']),
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
};

const scheduleSchema = z.object(baseScheduleFields).superRefine((data, ctx) => {
  // Validate start date and time
  if (data.startType === 'specific') {
    if (!data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date is required when start type is specific",
        path: ['startDate'],
      });
    }
    if (!data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start time is required when start type is specific",
        path: ['startTime'],
      });
    }
  }

  // Validate end date and time
  if (data.endType === 'specific') {
    if (!data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date is required when end type is specific",
        path: ['endDate'],
      });
    }
    if (!data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time is required when end type is specific",
        path: ['endTime'],
      });
    }
  }

  // Validate that end date is after start date when both are specific
  if (data.startType === 'specific' && data.endType === 'specific' && data.startDate && data.endDate) {
    if (data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ['endDate'],
      });
    } else if (data.startDate.getTime() === data.endDate.getTime() && data.startTime && data.endTime) {
      // If same day, check time
      const startTimeMinutes = convertTimeToMinutes(data.startTime);
      const endTimeMinutes = convertTimeToMinutes(data.endTime);
      if (startTimeMinutes >= endTimeMinutes) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End time must be after start time",
          path: ['endTime'],
        });
      }
    }
  }
});

// Helper function to convert time string (HH:mm) to minutes
function convertTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

const basicSchema = z.intersection(basicInfoSchema, scheduleSchema);

const textSchema = z.object({
  announcementText: z.string().min(1, "Campaign Message is required"),
  textColor: z.string(),
  fontSize: z.number().min(8).max(72),
  fontType: z.string(),
  fontUrl: z.string().optional()
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

// Define CTA schema based on type
const ctaSchema = z.discriminatedUnion('ctaType', [
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

const backgroundSchema = z.object({
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

const otherSchema = z.object({
  closeButtonPosition: z.enum(['right', 'left']),
  displayBeforeDelay: z.string(),
  showAfterClosing: z.string(),
  showAfterCTA: z.string(),
  selectedPages: z.array(z.string()).default(["__global"]).transform(pages => 
    pages.length === 0 ? ["__global"] : pages
  ),
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
  const validated = announcementSchema.parse(data);
  
  // Ensure selectedPages is __global when empty
  if (validated.other.selectedPages.length === 0) {
    validated.other.selectedPages = ["__global"];
  }
  
  return validated as AnnouncementBannerData;
}
