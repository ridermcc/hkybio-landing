-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- Adds a username column to the waitlist table for the "claim your name" flow

ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_waitlist_username ON waitlist (username);

-- Allow anon users to SELECT (check availability) on the waitlist table
CREATE POLICY "Allow anon to check username availability"
  ON waitlist
  FOR SELECT
  USING (true);

-- Allow anon users to INSERT (early email capture)
CREATE POLICY "Allow anon to insert waitlist"
  ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Allow anon users to UPDATE their own row (fill in remaining details)
CREATE POLICY "Allow anon to update waitlist"
  ON waitlist
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
