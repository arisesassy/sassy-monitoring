# Supabase Setup Guide

## 1. Setup Proyek Supabase

1. Buat akun di [Supabase](https://supabase.com) jika belum punya.
2. Buat proyek baru di dashboard Supabase.
3. Catat **Project URL** dan **anon/public key** dari **Settings → API**.

## 2. Konfigurasi Environment Variables

Edit file `.env.local` di root project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_FASTAPI_URL=https://your-fastapi-app.onrender.com
```

## 3. Jalankan SQL Schema

1. Buka **SQL Editor** di dashboard Supabase: `https://app.supabase.com/project/_/sql`
2. Copy-paste seluruh isi file `supabase/schema.sql`
3. Klik **Run** untuk eksekusi.

Script ini akan:
- Membuat tabel `telemetry`, `pid_parameters`, `sessions`
- Enable Row Level Security (RLS) dengan policy public read + authenticated write
- Enable Realtime untuk `telemetry` dan `pid_parameters`
- Seed data awal: PID aktif untuk Kain (Kp=8.0, Ki=0.08, Kd=10.0) dan Kulit (Kp=6.5, Ki=0.05, Kd=8.0)

## 4. Verifikasi Realtime

Di **Database → Replication**, pastikan publikasi `supabase_realtime` include tabel `telemetry` dan `pid_parameters`.

## 5. Struktur Tabel

### `telemetry`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | BIGSERIAL | Primary key |
| `session_id` | VARCHAR(50) | Kode sesi pengukusan |
| `timestamp` | TIMESTAMPTZ | Waktu pembacaan |
| `temp_actual` | NUMERIC(5,2) | Suhu aktual rata-rata |
| `temp_pt100_1` | NUMERIC(5,2) | Sensor PT100-1 |
| `temp_pt100_2` | NUMERIC(5,2) | Sensor PT100-2 |
| `temp_target` | NUMERIC(5,2) | Target suhu |
| `water_level` | NUMERIC(5,2) | Level air (%) |
| `process_progress` | NUMERIC(5,2) | Progres proses (%) |
| `remaining_time_seconds` | INTEGER | Sisa waktu (detik) |
| `machine_status` | VARCHAR(50) | Status mesin |
| `burner1_active` | BOOLEAN | Burner 1 nyala |
| `burner2_active` | BOOLEAN | Burner 2 nyala |
| `pid_output_percent` | NUMERIC(5,2) | Output PID (%) |
| `material_type` | VARCHAR(20) | 'Kain' atau 'Kulit' |
| `duration_minutes` | INTEGER | Durasi sesi (menit) |
| `flip_roll_interval_minutes` | INTEGER | Interval balik gulungan |

**Realtime**: Enabled via `postgres_changes` subscription

### `pid_parameters`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | BIGSERIAL | Primary key |
| `material_type` | VARCHAR(20) | 'Kain' atau 'Kulit' |
| `kp` | NUMERIC(10,4) | Proportional gain |
| `ki` | NUMERIC(10,4) | Integral gain |
| `kd` | NUMERIC(10,4) | Derivative gain |
| `status` | VARCHAR(20) | 'active' atau 'pending_review' |
| `created_at` | TIMESTAMPTZ | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | Waktu diupdate (auto-trigger) |
| `created_by` | VARCHAR(100) | Username atau 'fastapi-training' |

**Constraint**: Hanya boleh ada 1 PID `active` per `material_type`  
**Realtime**: Enabled via `postgres_changes` subscription

### `sessions`
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | BIGSERIAL | Primary key |
| `session_code` | VARCHAR(50) | Kode sesi (e.g., 'S-02N') |
| `material_type` | VARCHAR(20) | Jenis bahan |
| `target_temp` | NUMERIC(5,2) | Target suhu |
| `duration_minutes` | INTEGER | Durasi |
| `status` | VARCHAR(20) | 'Selesai' atau 'Dihentikan' |
| `started_at` | TIMESTAMPTZ | Waktu mulai |
| `ended_at` | TIMESTAMPTZ | Waktu selesai |

## 6. Alur Data

### ESP32 → Supabase
- ESP32 kirim POST request ke Supabase REST API endpoint:
  ```
  POST https://your-project.supabase.co/rest/v1/telemetry
  Headers: 
    apikey: YOUR_ANON_KEY
    Authorization: Bearer YOUR_ANON_KEY
    Content-Type: application/json
  Body: { session_id, temp_actual, ... }
  ```

### Dashboard → Realtime Subscription
```typescript
import { supabase } from '@/lib/supabase';

// Subscribe to telemetry updates
const channel = supabase
  .channel('telemetry-changes')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'telemetry' },
    (payload) => {
      console.log('New telemetry:', payload.new);
    }
  )
  .subscribe();
```

### FastAPI → PID Training
1. Admin klik "Update PID" di dashboard
2. Dashboard panggil FastAPI endpoint: `POST /train-pid`
3. FastAPI:
   - Ambil data telemetri dari Supabase
   - Latih model (e.g., Genetic Algorithm / Ziegler-Nichols)
   - Tulis hasil ke `pid_parameters` dengan `status='pending_review'`
4. Dashboard detect perubahan via Realtime subscription
5. Admin review & approve → update `status='active'`
6. ESP32 polling ambil PID aktif di awal sesi

## 7. Keepalive Strategy (Cegah Auto-Pause Free Tier)

Supabase free tier pause project setelah 7 hari tanpa aktivitas. Solusi:

**GitHub Actions Scheduled Workflow** (dijalankan tiap 3 hari):
```yaml
# .github/workflows/keepalive.yml
name: Supabase Keepalive
on:
  schedule:
    - cron: '0 0 */3 * *'  # Every 3 days at midnight UTC
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase
        run: |
          curl -X POST "${{ secrets.SUPABASE_URL }}/rest/v1/rpc/ping" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

Setup secrets di GitHub repository settings:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Atau bisa ping tabel langsung:
```bash
curl "$SUPABASE_URL/rest/v1/telemetry?limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY"
```

## 8. Testing

Test insert telemetri:
```bash
curl -X POST "https://your-project.supabase.co/rest/v1/telemetry" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "TEST-001",
    "temp_actual": 45.5,
    "temp_pt100_1": 45.8,
    "temp_pt100_2": 45.2,
    "temp_target": 70.0,
    "water_level": 85.0,
    "process_progress": 25.0,
    "remaining_time_seconds": 3600,
    "machine_status": "Running",
    "burner1_active": true,
    "burner2_active": false,
    "pid_output_percent": 42.5,
    "material_type": "Kain",
    "duration_minutes": 120,
    "flip_roll_interval_minutes": 30
  }'
```

Verifikasi di **Table Editor** Supabase.
