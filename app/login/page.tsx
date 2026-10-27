"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ImageIcon,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { supabase } = await import("@/lib/supabase");
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setIsLoading(false);
      setError(
        authError.message === "Invalid login credentials"
          ? "Email atau kata sandi salah."
          : authError.message
      );
      return;
    }

    if (data.session) {
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;

      const redirectTo = new URLSearchParams(window.location.search).get(
        "redirectTo"
      );
      const safeTarget =
        redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/dashboard";

      router.replace(safeTarget);
      router.refresh();
      return;
    }

    setIsLoading(false);
    setError("Sesi tidak berhasil dibuat. Silakan coba kembali.");
  }

  return (
    <main className="min-h-[100dvh] min-w-0 overflow-x-hidden bg-[#F6F7F2] p-3 text-[#2B3024] sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] min-w-0 max-w-[1440px] overflow-hidden rounded-[28px] border border-[#E1E5D8] bg-[#FAFAF7] shadow-[0_18px_55px_rgba(62,72,43,0.08)] sm:min-h-[calc(100dvh-2.5rem)] lg:grid-cols-[minmax(420px,0.82fr)_minmax(520px,1.18fr)]">
        <section className="flex min-h-full min-w-0 flex-col px-6 py-6 sm:px-10 sm:py-8 lg:px-14 xl:px-20">
          <header className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6E8143] text-white shadow-sm">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-[#2D361E]">
                SASSY Monitoring
              </p>
              <p className="text-[11px] font-medium text-[#77806B]">
                Sistem Kendali Steamer IoT
              </p>
            </div>
          </header>

          <div className="my-auto min-w-0 w-full max-w-md py-10 lg:py-8">
            <div className="mb-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#EEF1E7] px-3 py-1.5 text-[11px] font-semibold text-[#5E7036]">
                <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" />
                Portal admin terlindungi
              </div>
              <h1 className="text-[2rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#2D361E] sm:text-5xl">
                Selamat datang kembali.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#6E7760]">
                Masuk dengan akun admin untuk memantau proses dan mengendalikan
                perangkat SASSY.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-[#E9C3BC] bg-[#FDF1EE] px-4 py-3 text-xs font-medium leading-5 text-[#9C4A3F]"
              >
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-[#485336]"
                >
                  Email admin
                </label>
                <div className="relative rounded-2xl border border-[#CDD5BD] bg-white transition focus-within:border-[#6E8143] focus-within:ring-2 focus-within:ring-[#6E8143]/15">
                  <Mail
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#818C71]"
                    strokeWidth={1.8}
                  />
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@sassy.id"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl bg-transparent py-3.5 pl-11 pr-4 text-sm font-medium text-[#2D361E] outline-none placeholder:font-normal placeholder:text-[#8B9580]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-[#485336]"
                  >
                    Kata sandi
                  </label>
                  <span
                    title="Reset kata sandi belum tersedia. Hubungi pengelola akun."
                    className="cursor-help text-[11px] font-semibold text-[#879078]"
                  >
                    Lupa sandi? Hubungi pengelola
                  </span>
                </div>
                <div className="relative rounded-2xl border border-[#CDD5BD] bg-white transition focus-within:border-[#6E8143] focus-within:ring-2 focus-within:ring-[#6E8143]/15">
                  <LockKeyhole
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#818C71]"
                    strokeWidth={1.8}
                  />
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl bg-transparent py-3.5 pl-11 pr-12 text-sm text-[#2D361E] outline-none placeholder:text-[#8B9580]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                    }
                    className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center rounded-r-2xl text-[#818C71] transition hover:text-[#536331] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#6E8143]"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Eye aria-hidden="true" className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#6E8143] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_5px_16px_rgba(109,126,67,0.25)] transition hover:bg-[#5E7036] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    Memverifikasi…
                  </>
                ) : (
                  <>
                    Masuk ke sistem
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 max-w-full border-t border-[#E4E8DC] pt-5">
              <p className="text-xs font-semibold text-[#5C6847]">
                Login khusus admin
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#818A76]">
                Registrasi mandiri dan login Google tidak tersedia. Akun dibuat
                serta dikelola langsung melalui Supabase.
              </p>
            </div>
          </div>

          <footer className="text-[11px] text-[#8A947B]">
            © 2026 SASSY Monitoring · Akses terbatas
          </footer>
        </section>

        <aside className="relative hidden overflow-hidden bg-[#DDE4CE] p-4 lg:block">
          {/* TODO: ganti placeholder ini dengan hero image 1600x1800. */}
          <div className="relative h-full min-h-[680px] overflow-hidden rounded-[24px] border border-white/45 bg-[linear-gradient(145deg,#6E8143_0%,#819257_44%,#C5CFAB_100%)]">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/20" />
            <div className="absolute -right-4 top-16 h-56 w-56 rounded-full border border-white/20" />
            <div className="absolute bottom-0 left-0 h-2/3 w-full bg-[linear-gradient(to_top,rgba(42,53,28,0.78),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.22),transparent_28%)]" />

            <div className="absolute left-8 top-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#42502D]/35 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#DDE8BE]" />
              Monitoring suhu terintegrasi
            </div>

            <div className="absolute left-1/2 top-[43%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center text-white/85">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/10 backdrop-blur-sm">
                <ImageIcon aria-hidden="true" className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold">Placeholder hero image</p>
              <p className="mt-1 text-xs text-white/65">Rekomendasi 1600 × 1800 px</p>
            </div>

            <div className="absolute bottom-10 left-10 max-w-lg pr-10 text-white">
              <p className="text-3xl font-bold leading-tight tracking-[-0.035em] xl:text-4xl">
                Kendali proses yang jelas, dari satu layar.
              </p>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
                Pantau suhu, level air, burner, dan sesi pengeringan secara
                realtime.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
