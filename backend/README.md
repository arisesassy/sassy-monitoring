# SASSY PID Optimization Service (FastAPI)

Backend service untuk training & optimasi parameter PID pada mesin pengering SASSY. Berjalan di [Render](https://render.com) dan berkomunikasi langsung dengan Supabase PostgreSQL.

---

## 1. Persiapan Environment Variables

Kamu memerlukan 3 kunci:

### a. `SUPABASE_URL`
- Buka **Supabase Dashboard** → pilih project `sassy` (`kvxqbuhzkluxeeyhvliy`)
- Buka **Project Settings** (ikon gear di kiri bawah) → **API**
- Salin nilai **Project URL** (format: `https://kvxqbuhzkluxeeyhvliy.supabase.co`).

### b. `SUPABASE_SERVICE_ROLE_KEY`
- Di halaman yang sama (**Project Settings** → **API**)
- Cari bagian **Project API keys**
- Cari baris `service_role` (ditandai `secret`, warna merah/peringatan)
- Klik **Reveal** lalu salin nilainya.
- ⚠️ **PENTING**: Jangan gunakan `anon` key, karena backend membutuhkan akses tulis penuh untuk insert/update parameter PID.

### c. `FASTAPI_SECRET`
- String acak rahasia untuk memproteksi endpoint `/train-pid` agar tidak bisa ditembak sembarangan oleh publik.
- Kamu bisa generate dengan PowerShell:
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  ```
  atau di terminal Linux/macOS:
  ```bash
  openssl rand -hex 32
  ```
- Salin string ini, simpan untuk diset di Render dan di `.env.local` Next.js.

---

## 2. Cara Deploy ke Render

Ada dua cara deploy:

### Opsi A: Manual Web Service (Paling Mudah)
1. Buka [dashboard.render.com](https://dashboard.render.com).
2. Klik tombol **New +** → pilih **Web Service**.
3. Pilih repository GitHub: `manhildwinarno/sassy-monitoring`.
4. Isi konfigurasi berikut:
   - **Name**: `sassy-fastapi` (atau nama lain pilihanmu)
   - **Region**: `Singapore` (terdekat dengan Indonesia)
   - **Branch**: `main`
   - **Root Directory**: `backend` (⚠️ **Wajib diisi**, agar Render hanya build folder ini)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Gulir ke bawah ke bagian **Environment Variables**, klik **Add Environment Variable** untuk 4 kunci:
   - `PYTHON_VERSION` = `3.11.8`
   - `SUPABASE_URL` = (nilai dari langkah 1a)
   - `SUPABASE_SERVICE_ROLE_KEY` = (nilai dari langkah 1b)
   - `FASTAPI_SECRET` = (nilai dari langkah 1c)
6. Klik **Create Web Service**.
7. Tunggu build selesai sampai statusnya menjadi **Live**.
8. Salin URL publiknya, misal: `https://sassy-fastapi.onrender.com`.

### Opsi B: Menggunakan Blueprint (`render.yaml`)
1. Di Render Dashboard, klik **New +** → **Blueprint**.
2. Sambungkan repo `sassy-monitoring`.
3. Render akan membaca file `backend/render.yaml`.
4. Masukkan nilai untuk `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`.

---

## 3. Uji Coba Endpoint (Setelah Live)

### a. Uji Health Check
Buka browser atau gunakan curl:
```bash
curl https://sassy-fastapi.onrender.com/health
```
Harus menghasilkan:
```json
{
  "status": "ok",
  "timestamp": 1729000000.0,
  "supabase_configured": true,
  "secret_configured": true
}
```

### b. Uji Training Endpoint
```bash
curl -X POST https://sassy-fastapi.onrender.com/train-pid \
  -H "Authorization: Bearer <FASTAPI_SECRET_KAMU>" \
  -H "Content-Type: application/json"
```
Respon sukses:
```json
{
  "status": "success",
  "message": "Parameter PID optimal berhasil dihitung dan menunggu persetujuan admin di dashboard.",
  "telemetry_samples": 42,
  "parameters": [
    { "material_type": "Kain", "kp": 8.5, "ki": 0.09, "kd": 11.2 },
    { "material_type": "Kulit", "kp": 7.0, "ki": 0.06, "kd": 9.1 }
  ]
}
```
Setelah request di atas, buka Supabase Table Editor → tabel `pid_parameters` akan memiliki 2 baris baru berstatus `pending_review` dengan `created_by = 'fastapi-training'`.

---

## 4. Struktur Endpoint

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/` | Tidak | Info service |
| `GET` | `/health` | Tidak | Health check & verifikasi env |
| `POST` | `/train-pid` | Bearer Token (`FASTAPI_SECRET`) | Training & insert usulan PID ke Supabase |

---

## 5. Mengganti Mock ke Model ML Asli (Nanti)

Saat data telemetri sudah terkumpul dan model sudah dilatih:
1. Simpan model weights / file pickle di folder `backend/models/`.
2. Buka `backend/main.py`.
3. Cari komentar `TODO: Ganti blok ini dengan inferensi model asli`.
4. Ganti logic mock dengan kode inferensi model kamu.
5. Push ke GitHub, Render akan auto-deploy.
