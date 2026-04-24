-- Add disabled_sections column to track which components are hidden from the frontend
ALTER TABLE players ADD COLUMN IF NOT EXISTS disabled_sections TEXT[] DEFAULT '{}';

-- Optional: Ensure it's never null
UPDATE players SET disabled_sections = '{}' WHERE disabled_sections IS NULL;
ALTER TABLE players ALTER COLUMN disabled_sections SET DEFAULT '{}';
ALTER TABLE players ALTER COLUMN disabled_sections SET NOT NULL;
