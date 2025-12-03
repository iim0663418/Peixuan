CREATE TABLE `advanced_analysis_records` (
	`id` text PRIMARY KEY NOT NULL,
	`chart_id` text NOT NULL,
	`result` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`chart_id`) REFERENCES `chart_records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_advanced_analysis_chart_id` ON `advanced_analysis_records` (`chart_id`);
--> statement-breakpoint
CREATE INDEX `idx_advanced_analysis_created_at` ON `advanced_analysis_records` (`created_at`);
