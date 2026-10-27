"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Guard sisi client: memastikan hanya user yang sudah login (authenticated)
 * yang bisa merender halaman yang berisi Kontrol Proses.
 *
 * Middleware tetap menjadi lapisan pertama; guard ini menjaga kasus token
 * kedaluwarsa / cookie hilang setelah halaman sempat termuat.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;

      if (error || !data.user) {
        router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }

      setIsReady(true);
    });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!isReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F6F7F2" }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-[3px] border-[#6E8143]/30 border-t-[#6E8143] rounded-full animate-spin" />
          <p className="text-sm font-medium text-[#5E7036]">Memeriksa sesi…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
