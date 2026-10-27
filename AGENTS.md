<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SASSY IoT Monitoring System

## Stack
- Frontend: Next.js (App Router), Shadcn UI, Lenis (smooth scroll/motion), deploy ke Vercel.
- Database: Supabase (PostgreSQL). Supabase Realtime (WebSocket `postgres_changes`) aktif di tabel `telemetry` dan `pid_parameters`.
- Training Backend: FastAPI di Render. Training & optimasi parameter PID. Dipanggil via HTTPS API saat admin picu training.
- Keepalive: GitHub Actions cron ping tiap 3 hari cegah Supabase free tier auto-pause.

## Data Flow
1. Telemetri: ESP32 kirim langsung ke Supabase via HTTP POST (bukan lewat FastAPI).
2. Tuning PID:
   - Admin klik "Update PID" di dashboard.
   - Web server panggil HTTPS API FastAPI di Render.
   - FastAPI latih model & cari parameter optimal.
   - FastAPI tulis hasil ke tabel `pid_parameters` status `pending_review`.
3. Review & Approval:
   - Dashboard tampilkan perbandingan parameter lama vs baru.
   - Admin klik "Setujui" -> status berubah jadi `active`.
4. Pengambilan Parameter oleh Device:
   - ESP32 polling HTTP biasa ambil parameter status `active` di awal sesi (bukan WebSocket).

## Auth
- Login-only, tidak ada register. Hanya admin yang punya akun (dibuat manual di Supabase).

## UI References
- Struktur dan komponen ikuti folder `/references/`:
  - `references/dashboard.html` -> `/dashboard`
  - `references/profile.html` -> `/profile`
  - `references/history.html` -> `/history`
  - `references/login.html` -> `/login`
- Aturan: bangun struktur dan komponen identik referensi dulu. Motion polish menyusul.

## Skill UI
- Wajib: setiap kali mengerjakan UI (halaman, komponen, layout, styling, motion, atau redesign), muat skill `design-taste-frontend` terlebih dahulu dan ikuti panduannya sebelum menulis atau mengubah kode.

## Workflow
- Commit ke git setiap perubahan penting (fitur baru, refactor, fix). Pesan commit ringkas, deskriptif.

