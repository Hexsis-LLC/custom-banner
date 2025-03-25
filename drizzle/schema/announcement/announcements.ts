import {
  sqliteTable,
  integer,
  text,
} from 'drizzle-orm/sqlite-core';
import {z} from "zod";
import {SelectAnnouncementTextSchema, UpdateAnnouncementTextSchema} from "./announcement-text";
import {SelectCallToActionSchema, UpdateCallToActionSchema} from "./call-to-action";
import {SelectBannerBackgroundSchema, UpdateBannerBackgroundSchema} from "./banner-background";
import {SelectBannerFormSchema, UpdateBannerFormSchema} from "./banner-form";
import {
  SelectAnnouncementsXPagePatternsSchema,
  UpdateAnnouncementsXPagePatternsSchema
} from "./announcements-page-patterns";
import {SelectCountdownSettingsSchema} from "./countdown-settings";
import {createSelectSchema, createUpdateSchema} from "drizzle-zod";

// Table definition
export const announcements = sqliteTable('announcements', {
  id: integer('id').primaryKey({autoIncrement: true}),
  type: text('type', {enum: ['basic', 'countdown', 'email_signup', 'multi_text']}).notNull(),
  title: text('title').notNull(),
  shopId: text('shop_id').notNull(),
  size: text('size', {enum: ['small', 'mid', 'large', 'custom']}).notNull(),
  heightPx: integer('height_px'),
  widthPercent: integer('width_percent'),
  startType: text('start_type', {enum: ['now', 'specific']}).notNull().default('now'),
  endType: text('end_type', {enum: ['until_stop', 'specific']}).notNull().default('until_stop'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  showCloseButton: integer('show_close_button', {mode: 'boolean'}).default(true),
  closeButtonPosition: text('close_button_position', {
    enum: ['left', 'right', 'center', 'none']
  }).notNull(),
  closeButtonColor: text('close_button_color').notNull().default('rgb(255, 255, 255)'),
  timezone: text('timezone').default('UTC'),
  isActive: integer('is_active', {mode: 'boolean'}).default(true),
  status: text('status', {enum: ['draft', 'published', 'paused', 'ended']}).notNull().default('draft'),
  displayBeforeDelay: text('display_before_delay').default('none'),
  showAfterClosing: text('show_after_closing').default('none'),
  showAfterCTA: text('show_after_cta').default('none'),
  childAnnouncementId: integer('child_announcement_id'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

const SelectAnnouncementsSchema = createSelectSchema(announcements)

export const UpdateAnnouncementsBaseSchema = createUpdateSchema(announcements)

export const AnnouncementWithRelationsSchema = SelectAnnouncementsSchema.extend({
  texts: z.array(
    SelectAnnouncementTextSchema.extend({
      ctas: z.array(SelectCallToActionSchema),
    })
  ),
  background: SelectBannerBackgroundSchema, // One-to-one relation
  form: z.array(SelectBannerFormSchema), // Many-to-one relation
  pagePatternLinks: z.array(
    SelectAnnouncementsXPagePatternsSchema.extend({
      pagePattern: z.object({
        pattern: z.string(),
        id: z.number(),
      }),
    })
  ),
  countdownSettings: SelectCountdownSettingsSchema.nullable(), // Nullable one-to-one relation
});


export const UpdateAnnouncementsSchema = UpdateAnnouncementsBaseSchema.extend({
  texts: z.array(
    UpdateAnnouncementTextSchema.extend({
      ctas: z.array(UpdateCallToActionSchema),
    })
  ),
  background: UpdateBannerBackgroundSchema.superRefine((data, ctx) => {
    if (data.backgroundType === 'solid') {
      if (!data.backgroundColor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Background color is required for solid background",
          path: ['color1'],
        });
      }
    }

    if (data.backgroundType === 'gradient') {
      if (!data.gradientValue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Gradient value is required for gradient background",
          path: ['gradientValue'],
        });
      }
    }
  }), // One-to-one relation
  form: z.array(UpdateBannerFormSchema), // Many-to-one relation
  pagePatternLinks: z.array(
    UpdateAnnouncementsXPagePatternsSchema.extend({
      pagePattern: z.object({
        pattern: z.string(),
        id: z.number(),
      }),
    })
  ),
  countdownSettings: SelectCountdownSettingsSchema.nullable(), // Nullable one-to-one relation
}).superRefine((data, ctx) => {

  /// countdown
  if (data.type === 'countdown' && !data.countdownSettings) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Countdown settings is required for countdown announcement",
      path: ['countdownSettings'],
    });
  }
  if (data.type === 'countdown' && data.countdownSettings) {
    if (data.countdownSettings.timerType === 'till_end_date' && !data.countdownSettings.endDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date and time is required for fixed end date timer",
        path: ['endDateTime'],
      });
    }

    if (data.countdownSettings.timerType === 'duration') {
      const hasDuration =
        (data.countdownSettings.durationDays && data.countdownSettings.durationDays > 0) ||
        (data.countdownSettings.durationHours && data.countdownSettings.durationHours > 0) ||
        (data.countdownSettings.durationMinutes && data.countdownSettings.durationMinutes > 0) ||
        (data.countdownSettings.durationSeconds && data.countdownSettings.durationSeconds > 0);

      if (!hasDuration) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one duration field must be set",
          path: ['durationDays'],
        });
      }
    }

    if (data.countdownSettings.timerType === 'daily_schedule') {
      if (!data.countdownSettings.dailyStartTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Daily start time is required for daily schedule",
          path: ['dailyStartTime'],
        });
      }
      if (!data.countdownSettings.dailyEndTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Daily end time is required for daily schedule",
          path: ['dailyEndTime'],
        });
      }
    }

  }

});


export type Announcement = z.infer<typeof AnnouncementWithRelationsSchema>;
export type UpdateAnnouncement = z.infer<typeof UpdateAnnouncementsSchema>;
