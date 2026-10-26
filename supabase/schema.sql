-- SASSY IoT Monitoring System - Database Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- =====================================================
-- Function: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Table: telemetry
-- Purpose: Store real-time telemetry data from ESP32
-- =====================================================
CREATE TABLE IF NOT EXISTS telemetry (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Temperature readings
  temp_actual NUMERIC(5,2) NOT NULL, -- Average of PT100-1 and PT100-2
  temp_pt100_1 NUMERIC(5,2) NOT NULL,
  temp_pt100_2 NUMERIC(5,2) NOT NULL,
  temp_target NUMERIC(5,2) NOT NULL,
  
  -- Process state
  water_level NUMERIC(5,2) NOT NULL, -- Percentage (0-100)
  process_progress NUMERIC(5,2) NOT NULL DEFAULT 0, -- Percentage (0-100)
  remaining_time_seconds INTEGER NOT NULL DEFAULT 0,
  
  -- Machine state: 'Mesin Mati', 'Mesin Siap', 'Sedang Proses', 'Selesai'
  machine_status VARCHAR(50) NOT NULL,
  burner1_active BOOLEAN NOT NULL DEFAULT false,
  burner2_active BOOLEAN NOT NULL DEFAULT false,
  
  -- PID output
  pid_output_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  
  -- Session configuration
  material_type VARCHAR(20) NOT NULL, -- 'Kain' or 'Kulit'
  duration_minutes INTEGER NOT NULL,
  
  -- Indexes for query performance
  CONSTRAINT session_id_idx UNIQUE (session_id, timestamp)
);

-- Enable Row Level Security (RLS)
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read (ESP32 + dashboard can read)
CREATE POLICY "Allow public read on telemetry"
  ON telemetry FOR SELECT
  USING (true);

-- Policy: Allow authenticated/anon insert (ESP32 via anon key)
CREATE POLICY "Allow public insert on telemetry"
  ON telemetry FOR INSERT
  WITH CHECK (true);

-- Enable Realtime for telemetry table
ALTER PUBLICATION supabase_realtime ADD TABLE telemetry;

-- Indexes for faster session queries
CREATE INDEX IF NOT EXISTS telemetry_session_id_idx ON telemetry(session_id);
CREATE INDEX IF NOT EXISTS telemetry_timestamp_idx ON telemetry(timestamp DESC);

-- =====================================================
-- Table: pid_parameters
-- Purpose: Store PID tuning parameters (active & pending)
-- =====================================================
CREATE TABLE IF NOT EXISTS pid_parameters (
  id BIGSERIAL PRIMARY KEY,
  material_type VARCHAR(20) NOT NULL, -- 'Kain' or 'Kulit'
  
  -- PID coefficients
  kp NUMERIC(10,4) NOT NULL,
  ki NUMERIC(10,4) NOT NULL,
  kd NUMERIC(10,4) NOT NULL,
  
  -- Status: 'active' (currently used by ESP32), 'pending_review' (awaiting admin approval)
  status VARCHAR(20) NOT NULL DEFAULT 'pending_review',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(100) -- Admin username or 'fastapi-training'
);

-- Only one active PID parameter per material_type
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_pid_idx 
  ON pid_parameters (material_type) 
  WHERE status = 'active';

-- Enable RLS
ALTER TABLE pid_parameters ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read (ESP32 polls active params)
CREATE POLICY "Allow public read on pid_parameters"
  ON pid_parameters FOR SELECT
  USING (true);

-- Policy: Allow write (dashboard admin or FastAPI)
CREATE POLICY "Allow authenticated write on pid_parameters"
  ON pid_parameters FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable Realtime for pid_parameters table
ALTER PUBLICATION supabase_realtime ADD TABLE pid_parameters;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS pid_parameters_material_status_idx 
  ON pid_parameters(material_type, status);

-- Trigger auto updated_at
CREATE TRIGGER update_pid_parameters_updated_at
  BEFORE UPDATE ON pid_parameters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: sessions
-- Purpose: Store summary of completed/stopped sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  session_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'S-02N'
  
  -- Session configuration
  material_type VARCHAR(20) NOT NULL,
  target_temp NUMERIC(5,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  -- Session result
  status VARCHAR(20) NOT NULL, -- 'Selesai', 'Dihentikan'
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read
CREATE POLICY "Allow public read on sessions"
  ON sessions FOR SELECT
  USING (true);

-- Policy: Allow write
CREATE POLICY "Allow authenticated write on sessions"
  ON sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS sessions_started_at_idx ON sessions(started_at DESC);

-- =====================================================
-- Initial Data: Seed active PID parameters (idempotent)
-- =====================================================
INSERT INTO pid_parameters (material_type, kp, ki, kd, status, created_by)
SELECT 'Kain', 8.0, 0.08, 10.0, 'active', 'system-init'
WHERE NOT EXISTS (SELECT 1 FROM pid_parameters WHERE material_type = 'Kain' AND status = 'active');

INSERT INTO pid_parameters (material_type, kp, ki, kd, status, created_by)
SELECT 'Kulit', 6.5, 0.05, 8.0, 'active', 'system-init'
WHERE NOT EXISTS (SELECT 1 FROM pid_parameters WHERE material_type = 'Kulit' AND status = 'active');

-- =====================================================
-- Success message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'SASSY IoT Database Schema created successfully!';
  RAISE NOTICE 'Tables: telemetry, pid_parameters, sessions';
  RAISE NOTICE 'Realtime enabled on: telemetry, pid_parameters';
END $$;
