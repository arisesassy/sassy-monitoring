import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  // 1. Verifikasi autentikasi user via cookie sb-access-token
  const token = request.cookies.get("sb-access-token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Sesi tidak ditemukan. Silakan login kembali." },
      { status: 401 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json(
      { error: "Sesi kedaluwarsa atau tidak valid. Silakan login ulang." },
      { status: 401 }
    );
  }

  // 2. Ambil konfigurasi URL backend FastAPI
  const fastApiUrl =
    process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_FASTAPI_URL;
  const fastApiSecret = process.env.FASTAPI_SECRET;

  if (
    !fastApiUrl ||
    fastApiUrl.includes("your-fastapi-app") ||
    fastApiUrl === "https://..."
  ) {
    return NextResponse.json(
      {
        error:
          "URL FastAPI belum dikonfigurasi. Isi FASTAPI_URL di .env.local dengan URL Render kamu.",
      },
      { status: 503 }
    );
  }

  // 3. Teruskan request ke FastAPI di Render
  const targetUrl = `${fastApiUrl.replace(/\/$/, "")}/train-pid`;
  let payload: unknown = undefined;
  try {
    const rawBody = await request.text();
    if (rawBody) {
      payload = JSON.parse(rawBody);
    }
  } catch {
    // Body opsional
  }

  try {
    // Timeout 90 detik untuk antisipasi cold start Render free-tier (~50 detik)
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(fastApiSecret ? { Authorization: `Bearer ${fastApiSecret}` } : {}),
      },
      body: payload ? JSON.stringify(payload) : JSON.stringify({}),
      signal: AbortSignal.timeout(90000),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.detail ||
        data?.message ||
        `FastAPI mengembalikan error (HTTP ${response.status}).`;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    return NextResponse.json(data ?? { status: "success" });
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "TimeoutError" ||
        err.message.toLowerCase().includes("timeout"));

    const message = isTimeout
      ? "Koneksi ke backend Render timeout (>90s). Server Render free-tier kemungkinan sedang cold start (bangun dari sleep). Coba beberapa saat lagi."
      : `Gagal menghubungi backend training: ${err instanceof Error ? err.message : "Network error"}`;

    return NextResponse.json({ error: message }, { status: 504 });
  }
}
