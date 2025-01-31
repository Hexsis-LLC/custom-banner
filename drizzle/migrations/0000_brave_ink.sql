CREATE TABLE `onboarding` (
	`shop` text PRIMARY KEY NOT NULL,
	`has_completed_onboarding` integer DEFAULT false NOT NULL,
	`has_completed_embed` integer DEFAULT false NOT NULL,
	`has_completed_create_new_banner` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
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
