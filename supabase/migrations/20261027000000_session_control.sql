-- =====================================================
-- Migrasi: session_control, status "Jeda", dan pengetatan akses tulis
-- Jalankan lewat Supabase CLI (`supabase db push`) atau SQL Editor.
-- =====================================================

-- 1. Tambah status "Jeda" + kunci nilai machine_status
--    Drop/recreate agar migrasi tetap benar walau constraint lama sudah ada.
ALTER TABLE public.telemetry DROP CONSTRAINT IF EXISTS valid_machine_status;
ALTER TABLE public.telemetry
  ADD CONSTRAINT valid_machine_status
  CHECK (machine_status IN ('Mesin Mati','Mesin Siap','Sedang Proses','Jeda','Selesai'));

-- 2. Tabel kontrol live (TERPISAH dari sessions yang tetap jadi log riwayat)
CREATE TABLE IF NOT EXISTS public.session_control (
  id INT PRIMARY KEY DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'idle', -- 'idle'|'running'|'paused'|'stopped'
  target_temp NUMERIC(5,2),
  duration_minutes INTEGER,
  material_type VARCHAR(20),
  version BIGINT NOT NULL DEFAULT 0,
  updated_by VARCHAR(20),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.session_control (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.session_control ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated access session_control" ON public.session_control;
CREATE POLICY "Authenticated access session_control" ON public.session_control
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. sessions: hanya authenticated yang boleh akses (dashboard read-only)
DROP POLICY IF EXISTS "Allow read on sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow write on sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow public read on sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow authenticated write on sessions" ON public.sessions;
DROP POLICY IF EXISTS "Authenticated access sessions" ON public.sessions;
CREATE POLICY "Authenticated access sessions" ON public.sessions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. pid_parameters: perketat jalur TULIS saja.
--    Policy baca lama (semua role) tetap dipertahankan agar ESP32 tetap bisa polling.
DROP POLICY IF EXISTS "Allow write on pid_parameters" ON public.pid_parameters;
DROP POLICY IF EXISTS "Allow authenticated write on pid_parameters" ON public.pid_parameters;
DROP POLICY IF EXISTS "Authenticated write pid_parameters" ON public.pid_parameters;
DROP POLICY IF EXISTS "Authenticated update pid_parameters" ON public.pid_parameters;
DROP POLICY IF EXISTS "Authenticated delete pid_parameters" ON public.pid_parameters;

CREATE POLICY "Authenticated write pid_parameters" ON public.pid_parameters
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update pid_parameters" ON public.pid_parameters
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete pid_parameters" ON public.pid_parameters
  FOR DELETE TO authenticated USING (true);

-- 5. Realtime untuk session_control
ALTER TABLE public.session_control REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'session_control') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.session_control;
  END IF;
END $$;

-- 6. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_control TO authenticated;
GRANT SELECT, INSERT ON public.sessions TO authenticated;
