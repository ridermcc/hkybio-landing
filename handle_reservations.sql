-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- Creates a table to temporarily reserve usernames during registration

CREATE TABLE IF NOT EXISTS handle_reservations (
    username TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for expiration cleanup and performance
CREATE INDEX IF NOT EXISTS idx_handle_reservations_expires_at ON handle_reservations (expires_at);

-- RLS: Allow anon to check reservations (SELECT)
ALTER TABLE handle_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon to select reservations" ON handle_reservations;
CREATE POLICY "Allow anon to select reservations" 
  ON handle_reservations 
  FOR SELECT 
  USING (true);

-- (Optional but recommended) Cleanup function to delete expired reservations
-- This can be called by the API or via a pg_cron job if enabled.
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS void AS $$
BEGIN
    DELETE FROM handle_reservations WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to delete reservation when player profile is created
CREATE OR REPLACE FUNCTION delete_reservation_on_player_creation()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM handle_reservations WHERE username = NEW.username;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_delete_reservation_on_player_creation ON players;
CREATE TRIGGER tr_delete_reservation_on_player_creation
    AFTER INSERT ON players
    FOR EACH ROW
    EXECUTE FUNCTION delete_reservation_on_player_creation();
