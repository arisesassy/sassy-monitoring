"use client";

import { useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

function writeAccessToken(accessToken: string, expiresIn: number) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${expiresIn}; SameSite=Lax${secure}`;
}

function clearAccessToken() {
  document.cookie = "sb-access-token=; path=/; max-age=0; SameSite=Lax";
}

export function AuthSessionSync({ children }: { children: ReactNode }) {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event !== "SIGNED_OUT") {
        writeAccessToken(session.access_token, session.expires_in);
      } else if (event === "SIGNED_OUT") {
        clearAccessToken();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return children;
}
