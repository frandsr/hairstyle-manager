-- Drop Settings Table Migration
-- Removes the legacy settings table and associated objects

-- Drop trigger on auth.users first as it references the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function that inserts into settings
DROP FUNCTION IF EXISTS create_user_settings();

-- Drop the settings table (this cascades to indexes, policies, and table triggers)
DROP TABLE IF EXISTS settings;

-- Note: We don't need to drop the update_updated_at_column function as it's shared with other tables
