ALTER TABLE `announcements` ADD `start_type` text DEFAULT 'now' NOT NULL;--> statement-breakpoint
ALTER TABLE `announcements` ADD `end_type` text DEFAULT 'until_stop' NOT NULL;