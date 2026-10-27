"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ImageIcon, ShieldCheck } from "lucide-react";

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
    <main className="min-h-[100dvh] bg-[#FAFAF7] text-[#2B3024]">
      <div className="mx-auto grid min-h-[100dvh] max-w-[1600px] grid-cols-1 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col px-6 py-8 sm:px-12 lg:px-16 lg:py-10">
          <header className="flex items-center gap-2.5">
            <ShieldCheck
              aria-hidden="true"
              className="h-6 w-6 text-[#6E8143]"
              strokeWidth={1.8}
            />
            <p className="text-sm font-semibold tracking-tight">SASSY Monitoring</p>
          </header>

          <div className="mx-auto my-auto w-full max-w-[360px] py-16">
            <div className="mb-8">
              <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.035em] sm:text-[32px]">
                Selamat datang kembali
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#626A57]">
                Masuk ke akun admin SASSY Anda.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-[#E9C3BC] bg-[#FDF1EE] px-4 py-3 text-sm leading-5 text-[#9C4A3F]"
              >
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit} aria-busy={isLoading}>
              <div className="space-y-2">
                <label
                  htmlFor="admin-email"
                  className="block text-[13px] font-medium"
                >
                  Email admin
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@sassy.id"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-[#C5CBBC] bg-[#FAFAF7] px-3.5 py-3 text-sm outline-none placeholder:text-[#727B65] focus-visible:border-[#6E8143] focus-visible:ring-2 focus-visible:ring-[#6E8143] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF7]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="admin-password"
                  className="block text-[13px] font-medium"
                >
                  Kata sandi
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-describedby="password-help"
                    className="w-full rounded-xl border border-[#C5CBBC] bg-[#FAFAF7] py-3 pl-3.5 pr-12 text-sm outline-none placeholder:text-[#727B65] focus-visible:border-[#6E8143] focus-visible:ring-2 focus-visible:ring-[#6E8143] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                    }
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center rounded-r-xl text-[#626A57] hover:text-[#2B3024] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#6E8143]"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Eye aria-hidden="true" className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p id="password-help" className="pt-1 text-xs leading-5 text-[#626A57]">
                  Lupa kata sandi? Hubungi pengelola akun.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer whitespace-nowrap rounded-xl bg-[#6E8143] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5E7036] active:bg-[#4F602D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6E8143] disabled:cursor-wait disabled:bg-[#5E7036]"
              >
                {isLoading ? "Memverifikasi…" : "Masuk"}
              </button>
            </form>
          </div>

          <footer className="text-xs text-[#626A57]">
            © 2026 SASSY Monitoring
          </footer>
        </section>

        <aside className="hidden p-5 pl-0 lg:flex">
          {/* TODO: ganti placeholder ini dengan hero image 1600x1800. */}
          <div className="flex w-full items-center justify-center rounded-xl bg-[#E8ECDD]">
            <div className="flex flex-col items-center gap-3 text-[#626A57]">
              <ImageIcon aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
              <p className="text-xs">Gambar perangkat</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
