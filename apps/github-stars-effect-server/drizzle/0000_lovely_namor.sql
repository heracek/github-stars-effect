CREATE TABLE `starred_repo` (
	`id` integer PRIMARY KEY NOT NULL,
	`starred_at` numeric NOT NULL,
	`name` text NOT NULL,
	`full_name` text NOT NULL,
	`owner` text NOT NULL,
	`html_url` text NOT NULL,
	`language` text,
	`description` text,
	`topics` text
);
