-- Migration: Remove shift_pattern_start column
-- Date: 2026-01-10
-- Reason: Field is deprecated, now using effective_from for shift rotation calculations

-- Drop column from settings_history table
ALTER TABLE settings_history
DROP COLUMN IF EXISTS shift_pattern_start;

-- Drop column from settings table (if it still exists)
ALTER TABLE settings
DROP COLUMN IF EXISTS shift_pattern_start;

-- Update comment on current_shift column to reflect the change
COMMENT ON COLUMN settings_history.current_shift IS 
'Manual override for the shift. NULL = automatic calculation based on effective_from, ''morning'' = force morning shift, ''afternoon'' = force afternoon shift';
