ALTER TABLE `announcements` ADD `status` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
CREATE INDEX `announcements_status_idx` ON `announcements` (`status`);