CREATE TABLE `quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`week` integer NOT NULL,
	`correct_count` integer NOT NULL,
	`question_count` integer NOT NULL,
	`duration_seconds` integer NOT NULL,
	`completed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_quiz_attempts_week_completed_at` ON `quiz_attempts` (`week`,`completed_at`);--> statement-breakpoint
CREATE INDEX `idx_quiz_attempts_session_week_completed_at` ON `quiz_attempts` (`session_id`,`week`,`completed_at`);--> statement-breakpoint
PRAGMA optimize;
