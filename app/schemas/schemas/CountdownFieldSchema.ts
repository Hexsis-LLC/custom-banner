import { z } from "zod";

export const countdownFieldSchema = z.object({
  timerType: z.enum(['till_end_date', 'duration', 'daily_schedule']),
  timeFormat: z.string().default('HH:mm:ss'),
  showDays: z.boolean().default(true),
  endDateTime: z.string().optional(),
  durationDays: z.number().optional(),
  durationHours: z.number().optional(),
  durationMinutes: z.number().optional(),
  durationSeconds: z.number().optional(),
  dailyStartTime: z.string().optional(),
  dailyEndTime: z.string().optional(),
  afterTimerEnds: z.object({
    action: z.enum(['hide', 'show_zeros', 'create_announcement']),
    childAnnouncementId: z.number().optional(),
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.timerType === 'till_end_date' && !data.endDateTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date and time is required for fixed end date timer",
      path: ['endDateTime'],
    });
  }
  
  if (data.timerType === 'duration') {
    const hasDuration = 
      (data.durationDays && data.durationDays > 0) || 
      (data.durationHours && data.durationHours > 0) || 
      (data.durationMinutes && data.durationMinutes > 0) ||
      (data.durationSeconds && data.durationSeconds > 0);
      
    if (!hasDuration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one duration field must be set",
        path: ['durationDays'],
      });
    }
  }
  
  if (data.timerType === 'daily_schedule') {
    if (!data.dailyStartTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Daily start time is required for daily schedule",
        path: ['dailyStartTime'],
      });
    }
    if (!data.dailyEndTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Daily end time is required for daily schedule",
        path: ['dailyEndTime'],
      });
    }
  }
});

export type CountdownFieldData = z.infer<typeof countdownFieldSchema>; 