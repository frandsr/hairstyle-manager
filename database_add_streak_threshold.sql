-- Migration: Add streak_bonus_threshold field
-- Date: 2026-01-10
-- Reason: Fix streak bonus logic to require a threshold to be met

-- Add column to settings_history table
ALTER TABLE settings_history
ADD COLUMN IF NOT EXISTS streak_bonus_threshold NUMERIC DEFAULT 0;

-- Add column to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS streak_bonus_threshold NUMERIC DEFAULT 0;

-- Update comment
COMMENT ON COLUMN settings_history.streak_bonus_threshold IS 
'Minimum weekly revenue required to activate streak bonus. If revenue >= threshold, streak bonus applies. If revenue < threshold, streak resets to 0.';
