-- ================================================
-- ESTILISTA PRO - COMPLETE DATABASE SCHEMA
-- ================================================
-- Run this SQL in Supabase SQL Editor to create all tables
-- ================================================

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    notes TEXT,
    status TEXT CHECK (status IN ('good', 'warning', 'bad')) DEFAULT 'good',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    tip_amount NUMERIC DEFAULT 0 CHECK (tip_amount >= 0),
    date TIMESTAMPTZ NOT NULL,
    description TEXT,
    photos TEXT[],
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);



-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(date);


-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;


-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;



-- CLIENTS TABLE POLICIES
CREATE POLICY "Users can view own clients"
    ON clients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
    ON clients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
    ON clients FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
    ON clients FOR DELETE
    USING (auth.uid() = user_id);

-- JOBS TABLE POLICIES
CREATE POLICY "Users can view own jobs"
    ON jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
    ON jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
    ON jobs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
    ON jobs FOR DELETE
    USING (auth.uid() = user_id);



-- ================================================
-- AUTOMATIC TIMESTAMP UPDATES
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();





-- ================================================
-- DONE!
-- ================================================
-- Your database is now ready to use with EstilistaPro
