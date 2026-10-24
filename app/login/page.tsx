"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin_operator");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Dummy auth check — later replace with supabase.auth.signInWithPassword()
    setTimeout(() => {
      if (username && password) {
        setIsLoading(false);
        router.push("/dashboard");
      } else {
        setIsLoading(false);
        setError("Username dan kata sandi wajib diisi");
      }
    }, 600);
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-between p-6 md:p-10 select-none"
      style={{ backgroundColor: "#F6F7F2", color: "#2B3024" }}
    >
      {/* Top Bar / Brand Indicator */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#6D7E43] flex items-center justify-center text-white shadow-sm">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-[#2D361E] leading-tight">
              Steamer IoT System
            </h1>
            <p className="text-xs text-[#707963] font-medium">
              Monitoring & Kontrol Suhu
            </p>
          </div>
        </div>

        {/* Device Connectivity Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-[#FFFFFF] border border-[#E4E7DB] px-3.5 py-1.5 rounded-full shadow-sm text-xs text-[#525D3F]">
          <span className="w-2 h-2 rounded-full bg-[#6D7E43] animate-pulse"></span>
          <span className="font-medium text-[#707963]">Perangkat:</span>
          <span className="font-semibold text-[#2D361E]">ESP32-S3 Online</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-[#FCFDF9] border border-[#EAEDE3] rounded-[32px] p-8 md:p-10 shadow-[0_10px_30px_rgba(45,54,30,0.04)]">
          {/* Header Section inside Card */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#6D7E43]/15 text-[#5E6E37] mb-4">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#2D361E] tracking-tight">
              Portal Masuk Admin
            </h2>
            <p className="text-xs text-[#6E7760] mt-1.5">
              Akses khusus operator & administrator sistem
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Field Username */}
            <div>
              <label className="block text-xs font-semibold text-[#485336] mb-2 tracking-wide">
                Username / ID Admin
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Masukkan username admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#D2D9C4] rounded-2xl text-sm text-[#2D361E] placeholder-[#A4AD97] focus:outline-none focus:border-[#6D7E43] focus:ring-2 focus:ring-[#6D7E43]/20 transition-all font-medium pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#8E987F]">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Field Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-[#485336] tracking-wide">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-[#6D7E43] hover:underline cursor-pointer"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#D2D9C4] rounded-2xl text-sm text-[#2D361E] placeholder-[#A4AD97] focus:outline-none focus:border-[#6D7E43] focus:ring-2 focus:ring-[#6D7E43]/20 transition-all tracking-wider pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E987F] hover:text-[#525D3F] cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-[#C7CFB8] text-[#6D7E43] focus:ring-[#6D7E43]/30 accent-[#6D7E43]"
                />
                <span className="text-xs text-[#5F6850] font-medium">
                  Ingat kredensial di alat ini
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#6D7E43] hover:bg-[#5E6E37] disabled:opacity-70 text-white font-semibold text-sm rounded-full shadow-[0_4px_14px_rgba(109,126,67,0.35)] transition-all flex items-center justify-center gap-2 group active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi…</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* System Notice (No registration allowed) */}
          <div className="mt-8 pt-5 border-t border-[#ECEFE7] text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F1F4EA] rounded-full text-[11px] font-medium text-[#5C6847]">
              <svg
                className="w-3.5 h-3.5 text-[#6D7E43]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Registrasi dinonaktifkan (Akun Dikelola Pusat)</span>
            </div>
            <p className="text-[11px] text-[#8E987F] mt-2">
              Hubungi tim teknisi hardware jika Anda memerlukan penambahan
              otorisasi operator.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A947B] pt-4 gap-2">
        <div>
          &copy; 2026 Steamer Machine Automation System. Hak Cipta Dilindungi.
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-[#586444] transition-colors cursor-pointer">
            Protokol Keamanan
          </span>
          <span>•</span>
          <span className="hover:text-[#586444] transition-colors cursor-pointer">
            Bantuan Teknis
          </span>
          <span>•</span>
          <span className="font-mono text-[11px] bg-[#E8ECDD] px-2 py-0.5 rounded text-[#4C5836]">
            v2.4-ESP
          </span>
        </div>
      </footer>
    </div>
  );
}
