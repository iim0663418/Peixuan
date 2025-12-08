-- Add analysis_type column to advanced_analysis_records table
ALTER TABLE `advanced_analysis_records` ADD COLUMN `analysis_type` text DEFAULT 'ai-advanced-zh-TW' NOT NULL;
--> statement-breakpoint
-- Drop old unique index on chart_id only
DROP INDEX IF EXISTS `idx_advanced_analysis_chart_id`;
--> statement-breakpoint
-- Create new composite unique index on (chart_id, analysis_type)
CREATE UNIQUE INDEX `idx_advanced_analysis_chart_id_type` ON `advanced_analysis_records` (`chart_id`, `analysis_type`);
