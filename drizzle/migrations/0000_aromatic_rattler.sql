CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`shop` text NOT NULL,
	`state` text NOT NULL,
	`isOnline` integer DEFAULT false NOT NULL,
	`scope` text,
	`expires` text,
	`accessToken` text,
	`userId` blob
);
--> statement-breakpoint
CREATE TABLE `onboarding` (
	`shop` text PRIMARY KEY NOT NULL,
	`has_completed_onboarding` integer DEFAULT false NOT NULL,
	`has_completed_embed` integer DEFAULT false NOT NULL,
	`has_completed_create_new_banner` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `announcement_text` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`announcement_id` integer NOT NULL,
	`text_message` text NOT NULL,
	`text_color` text NOT NULL,
	`font_size` integer NOT NULL,
	`custom_font` text,
	`font_type` text DEFAULT 'site' NOT NULL,
	`language_code` text DEFAULT 'en',
	FOREIGN KEY (`announcement_id`) REFERENCES `announcements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `text_announcement_idx` ON `announcement_text` (`announcement_id`);--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`shop_id` text NOT NULL,
	`size` text NOT NULL,
	`height_px` integer,
	`width_percent` integer,
	`start_type` text DEFAULT 'now' NOT NULL,
	`end_type` text DEFAULT 'until_stop' NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`show_close_button` integer DEFAULT true,
	`close_button_position` text NOT NULL,
	`countdown_end_time` text,
	`timezone` text DEFAULT 'UTC',
	`is_active` integer DEFAULT true,
	`status` text DEFAULT 'draft' NOT NULL,
	`display_before_delay` text DEFAULT 'none',
	`show_after_closing` text DEFAULT 'none',
	`show_after_cta` text DEFAULT 'none'
);
--> statement-breakpoint
CREATE INDEX `announcements_type_idx` ON `announcements` (`type`);--> statement-breakpoint
CREATE INDEX `announcements_date_idx` ON `announcements` (`start_date`,`end_date`);--> statement-breakpoint
CREATE INDEX `announcements_shop_idx` ON `announcements` (`shop_id`);--> statement-breakpoint
CREATE INDEX `announcements_status_idx` ON `announcements` (`status`);--> statement-breakpoint
CREATE TABLE `announcements_X_page_patterns` (
	`page_patterns_id` integer NOT NULL,
	`announcements_id` integer NOT NULL,
	PRIMARY KEY(`page_patterns_id`, `announcements_id`),
	FOREIGN KEY (`page_patterns_id`) REFERENCES `page_patterns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`announcements_id`) REFERENCES `announcements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `page_patterns_idx` ON `announcements_X_page_patterns` (`page_patterns_id`);--> statement-breakpoint
CREATE INDEX `announcements_idx` ON `announcements_X_page_patterns` (`announcements_id`);--> statement-breakpoint
CREATE TABLE `banner_background` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`announcement_id` integer NOT NULL,
	`bg_color` text NOT NULL,
	`background_type` text DEFAULT 'solid' NOT NULL,
	`gradient_value` text,
	`background_pattern` text,
	`padding` text DEFAULT '10px 15px',
	FOREIGN KEY (`announcement_id`) REFERENCES `announcements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `banner_background_announcement_id_unique` ON `banner_background` (`announcement_id`);--> statement-breakpoint
CREATE TABLE `banner_form` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`announcement_id` integer NOT NULL,
	`input_type` text NOT NULL,
	`placeholder` text,
	`label` text,
	`is_required` integer DEFAULT true,
	`validation_regex` text,
	FOREIGN KEY (`announcement_id`) REFERENCES `announcements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `call_to_action` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`announcement_text_id` integer NOT NULL,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`link` text NOT NULL,
	`bg_color` text NOT NULL,
	`text_color` text NOT NULL,
	`button_radius` integer DEFAULT 4,
	`padding` text DEFAULT '10px 20px',
	`font_type` text DEFAULT 'site' NOT NULL,
	`font_url` text,
	FOREIGN KEY (`announcement_text_id`) REFERENCES `announcement_text`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `page_patterns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pattern` text DEFAULT '__global' NOT NULL
);
