CREATE TABLE `onboarding` (
	`shop` text PRIMARY KEY NOT NULL,
	`hasCompletedOnboarding` integer DEFAULT false NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
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
