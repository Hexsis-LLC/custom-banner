ALTER TABLE `announcements` RENAME COLUMN "shop" TO "shop_id";--> statement-breakpoint
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
CREATE TABLE `page_patterns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pattern` text DEFAULT '__global' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `announcements_shop_idx` ON `announcements` (`shop_id`);--> statement-breakpoint
ALTER TABLE `announcements` DROP COLUMN `specific_page`;--> statement-breakpoint
CREATE UNIQUE INDEX `banner_background_announcement_id_unique` ON `banner_background` (`announcement_id`);