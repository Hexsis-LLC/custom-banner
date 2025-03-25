import {
  sqliteTable,
  integer,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import {relations} from 'drizzle-orm';
import {announcementText} from './announcement-text';
import {createInsertSchema, createSelectSchema} from "drizzle-zod";
import {z} from "zod";
import {EFontTypeSchema} from "../../../app/types/announcement";

// Table definition
export const callToAction = sqliteTable('call_to_action', {
  id: integer('id').primaryKey({autoIncrement: true}),
  announcementTextId: integer('announcement_text_id')
    .references(() => announcementText.id)
    .notNull(),
  type: text('type', {enum: ['button', 'text', "bar", "none"]}).notNull(),
  text: text('text'),
  link: text('link'),
  bgColor: text('bg_color'),
  textColor: text('text_color'),
  buttonRadius: integer('button_radius').default(4),
  padding: text('padding').default('10px 20px'),
  fontType: text('font_type', {enum: ['site', 'custom', 'dynamic']}).default('site'),
  fontUrl: text('font_url'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  textIdx: index('cta_text_idx').on(table.announcementTextId)
}));

// Relations
export const callToActionRelations = relations(callToAction, ({one}) => ({
  announcementText: one(announcementText, {
    fields: [callToAction.announcementTextId],
    references: [announcementText.id],
  }),
}));

// Define the discriminated union schema based on the type field
export const UpdateCallToActionSchema = z.discriminatedUnion('type', [
  // Button type
  z.object({
    type: z.literal('none'),
    text: z.string().optional(),
    link: z.string().optional(),
    bgColor: z.string().optional(),
    textColor: z.string().optional(),
    buttonRadius: z.string().optional(),
    padding: z.string().optional(),
    fontType: EFontTypeSchema.default('site'),
    fontUrl: z.string().optional(),
  }),

  z.object({
    type: z.literal('button'),
    text: z.string().min(1, "Button text is required"),
    link: z.string().url("Please enter a valid URL"),
    bgColor: z.string().min(1, "Background color is required"),
    textColor: z.string().min(1, "Text color is required"),
    buttonRadius: z.number().int().nonnegative().default(4),
    padding: z.string().default('10px 20px'),
    fontType: EFontTypeSchema.default('site'),
    fontUrl: z.string().optional(),
  }),
  // Text type
  z.object({
    type: z.literal('text'),
    text: z.string().min(1, "Text is required"),
    link: z.string().url("Please enter a valid URL"),
    bgColor: z.string().optional(),
    textColor: z.string().min(1, "Text color is required"),
    buttonRadius: z.number().int().optional(),
    padding: z.string().default('10px 20px'),
    fontType: EFontTypeSchema.default('site'),
    fontUrl: z.string().optional(),
  }),
]).superRefine((data, ctx) => {
  // Only require font URL for custom fonts
  if ((data.fontType === 'custom' || data.fontType === 'dynamic') && !data.fontUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Font URL is required for custom fonts",
      path: ['fontUrl'],
    });
  }
});

// Type export for the discriminated union
export type UpdateCallToAction = z.infer<typeof UpdateCallToActionSchema>;

// Base schemas from drizzle-zod
export const SelectCallToActionSchema = createSelectSchema(callToAction);
export const InsertCallToActionSchema = createInsertSchema(callToAction);


