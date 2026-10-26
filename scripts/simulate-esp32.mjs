// scripts/simulate-esp32.mjs
// Simulasi pengiriman data telemetri dari ESP32 langsung ke REST API Supabase.
// Jalankan dengan: node scripts/simulate-esp32.mjs

import fs from "fs";
import path from "path";

// Baca .env.local secara manual (tanpa dependency dotenv tambahan)
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");

const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes("your-project")) {
  console.error("Error: Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah diisi dengan benar di .env.local");
  process.exit(1);
}

const endpoint = `${SUPABASE_URL}/rest/v1/telemetry`;

console.log("==========================================");
console.log(" Simulasi ESP32 Steamer IoT System");
console.log(` Target: ${endpoint}`);
console.log(" Tekan Ctrl+C untuk berhenti");
console.log("==========================================\n");

const sessionId = `SESI-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-01`;
let currentTemp = 32.0;
const targetTemp = 75.0;
let progress = 10;
let remainingSeconds = 3600;

async function sendTelemetry() {
  // Simulasi kenaikan suhu perlahan menuju target
  if (currentTemp < targetTemp) {
    currentTemp += 0.4 + (Math.random() * 0.4 - 0.2);
  } else {
    currentTemp += (Math.random() * 0.6 - 0.3); // Fluktuasi di sekitar target
  }
  currentTemp = Number(currentTemp.toFixed(2));

  // Simulasi pembacaan dua sensor PT100
  const pt1 = Number((currentTemp + (Math.random() * 0.4 - 0.2)).toFixed(2));
  const pt2 = Number((currentTemp + (Math.random() * 0.4 - 0.2)).toFixed(2));

  // Update progress
  if (progress < 100) progress += 0.5;
  if (remainingSeconds > 0) remainingSeconds -= 2;

  const payload = {
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    temp_actual: currentTemp,
    temp_pt100_1: pt1,
    temp_pt100_2: pt2,
    temp_target: targetTemp,
    water_level: Number((82.0 - (progress * 0.15)).toFixed(1)),
    process_progress: Number(progress.toFixed(1)),
    remaining_time_seconds: remainingSeconds,
    machine_status: currentTemp < targetTemp - 2 ? "Pre-Heating" : "Running",
    burner1_active: true,
    burner2_active: currentTemp < targetTemp - 5,
    pid_output_percent: Number((Math.max(10, Math.min(100, (targetTemp - currentTemp) * 12 + 25))).toFixed(1)),
    material_type: "Kain",
    duration_minutes: 60,
    flip_roll_interval_minutes: 15,
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[${new Date().toLocaleTimeString()}] Telemetri terkirim -> Suhu: ${currentTemp}°C | PT1: ${pt1}°C | PT2: ${pt2}°C | Progres: ${payload.process_progress}% | Burner: ${payload.burner1_active ? 'B1 on' : 'off'}, ${payload.burner2_active ? 'B2 on' : 'off'}`);
    } else {
      const err = await res.text();
      console.error(`[Error ${res.status}]:`, err);
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

// Kirim tiap 2 detik (sama seperti interval ESP32 asli)
sendTelemetry();
setInterval(sendTelemetry, 2000);
