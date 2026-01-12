-- ================================================
-- Settings History Week-Based Refactor Migration
-- ================================================
-- This migration refactors settings_history to be strictly week-based
-- with automatic creation and boolean streak tracking

-- Step 1: Delete any future settings_history records
-- (where effective_from > current week start)
DELETE FROM settings_history
WHERE effective_from > (
    -- Get current week start (Saturday)
    DATE_TRUNC('week', NOW()) + INTERVAL '6 days'
);

-- Step 2: Add new streak_threshold_met boolean field
-- Default to TRUE for existing records (since this is pre-production with minimal data)
ALTER TABLE settings_history
ADD COLUMN IF NOT EXISTS streak_threshold_met BOOLEAN DEFAULT TRUE NOT NULL;

-- Step 3: Remove the old current_streak_count field
ALTER TABLE settings_history
DROP COLUMN IF EXISTS current_streak_count;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run these to verify the migration succeeded:

-- Check that no future records exist
-- SELECT COUNT(*) FROM settings_history 
-- WHERE effective_from > NOW();
-- Should return 0

-- Check that streak_threshold_met field exists
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'settings_history' 
--   AND column_name = 'streak_threshold_met';

-- Check that current_streak_count is gone
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'settings_history' 
--   AND column_name = 'current_streak_count';
-- Should return 0 rows

-- View all settings_history records
-- SELECT id, user_id, effective_from, effective_to, streak_threshold_met, weekly_target 
-- FROM settings_history 
-- ORDER BY effective_from DESC;
