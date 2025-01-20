CREATE TABLE `onboarding` (
	`shop` text PRIMARY KEY NOT NULL,
	`hasCompletedOnboarding` integer DEFAULT false NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
