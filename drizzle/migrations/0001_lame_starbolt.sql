CREATE TABLE `announcement_text` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`announcement_id` integer NOT NULL,
	`text_message` text NOT NULL,
	`text_color` text NOT NULL,
	`font_size` integer NOT NULL,
	`custom_font` text,
	`language_code` text DEFAULT 'en',
	FOREIGN KEY (`announcement_id`) REFERENCES `announcements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `text_announcement_idx` ON `announcement_text` (`announcement_id`);--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`shop` text NOT NULL,
	`size` text NOT NULL,
	`height_px` integer,
	`width_percent` integer,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`show_close_button` integer DEFAULT true,
	`close_button_position` text NOT NULL,
	`specific_page` text,
	`countdown_end_time` text,
	`timezone` text DEFAULT 'UTC',
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE INDEX `announcements_type_idx` ON `announcements` (`type`);--> statement-breakpoint
CREATE INDEX `announcements_date_idx` ON `announcements` (`start_date`,`end_date`);--> statement-breakpoint
CREATE TABLE `banner_background` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`announcement_id` integer NOT NULL,
	`bg_color` text NOT NULL,
	`background_pattern` text,
	`padding` text DEFAULT '10px 15px',
	FOREIGN KEY (`announcement_id`) REFERENCES `announcements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
	FOREIGN KEY (`announcement_text_id`) REFERENCES `announcement_text`(`id`) ON UPDATE no action ON DELETE no action
);
