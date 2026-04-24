-- Add show_stats_bio column to the players table
-- This controls whether bio details (position, height, weight, etc.) are shown in the Stats component
ALTER TABLE players ADD COLUMN IF NOT EXISTS show_stats_bio BOOLEAN DEFAULT false;

-- Update existing rows to default to false (already handled by DEFAULT, but just in case)
UPDATE players SET show_stats_bio = false WHERE show_stats_bio IS NULL;
