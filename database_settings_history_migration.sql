-- Settings History Migration
-- Creates temporal settings tracking for accurate historical commission calculations

-- ================================================
-- CREATE SETTINGS_HISTORY TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS settings_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Commission settings
    weekly_target NUMERIC NOT NULL,
    base_commission_rate NUMERIC NOT NULL,
    streak_bonus_rate NUMERIC NOT NULL,
    current_streak_count INTEGER DEFAULT 0,
    fixed_bonus_tiers JSONB DEFAULT '[]',
    
    -- Shift settings
    week_start_day INTEGER DEFAULT 1,
    shift_pattern_start TIMESTAMPTZ NOT NULL,
    current_shift TEXT CHECK (current_shift IN ('morning', 'afternoon')),
    
    -- Temporal tracking
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: current_shift is nullable
-- If NULL: Calculate shift automatically based on shift_pattern_start
-- If set: Override automatic calculation for this settings period

-- ================================================
-- INDEXES
-- ================================================

-- Index for efficient temporal queries
CREATE INDEX idx_settings_history_user_effective 
ON settings_history(user_id, effective_from, effective_to);

-- Index for fetching active settings
CREATE INDEX idx_settings_history_active
ON settings_history(user_id, effective_to)
WHERE effective_to IS NULL;

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE settings_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own settings history" ON settings_history;
DROP POLICY IF EXISTS "Users can insert own settings history" ON settings_history;
DROP POLICY IF EXISTS "Users can update own settings history" ON settings_history;

-- View policy
CREATE POLICY "Users can view own settings history"
    ON settings_history FOR SELECT
    USING (auth.uid() = user_id);

-- Insert policy
CREATE POLICY "Users can insert own settings history"
    ON settings_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Update policy
CREATE POLICY "Users can update own settings history"
    ON settings_history FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ================================================
-- TRIGGERS
-- ================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_history_updated_at
    BEFORE UPDATE ON settings_history
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_history_updated_at();

-- ================================================
-- DATA MIGRATION
-- ================================================

-- Migrate existing settings to settings_history
-- This creates a historical record for each user's current settings
INSERT INTO settings_history (
    user_id,
    weekly_target,
    base_commission_rate,
    streak_bonus_rate,
    current_streak_count,
    fixed_bonus_tiers,
    week_start_day,
    shift_pattern_start,
    effective_from,
    effective_to
)
SELECT 
    user_id,
    weekly_target,
    base_commission_rate,
    streak_bonus_rate,
    current_streak_count,
    fixed_bonus_tiers,
    week_start_day,
    shift_pattern_start,
    created_at as effective_from,
    NULL as effective_to  -- Currently active
FROM settings
ON CONFLICT DO NOTHING;  -- In case this migration runs multiple times
