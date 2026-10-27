"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export type SessionControlStatus = "idle" | "running" | "paused" | "stopped";

export interface SessionControlRow {
  id: number;
  status: SessionControlStatus;
  target_temp: number | null;
  duration_minutes: number | null;
  material_type: string | null;
  version: number;
  updated_by: string | null;
  updated_at: string;
}

export type SessionControlPatch = Partial<
  Pick<
    SessionControlRow,
    "status" | "target_temp" | "duration_minutes" | "material_type"
  >
>;

interface SessionControlContextType {
  control: SessionControlRow | null;
  isLoading: boolean;
  isSaving: boolean;
  updateControl: (patch: SessionControlPatch) => Promise<void>;
}

const SessionControlContext = createContext<SessionControlContextType>({
  control: null,
  isLoading: true,
  isSaving: false,
  updateControl: async () => {},
});

export function SessionControlProvider({ children }: { children: ReactNode }) {
  const [control, setControl] = useState<SessionControlRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchControl() {
      const { data, error } = await supabase
        .from("session_control")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error("[useSessionControl] fetch error:", error.message);
      }

      if (isMounted) {
        if (data) setControl(data as SessionControlRow);
        setIsLoading(false);
      }
    }

    fetchControl();

    const channelName = `realtime-session-control-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_control",
        },
        () => {
          if (isMounted) fetchControl();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const updateControl = useCallback(async (patch: SessionControlPatch) => {
    setIsSaving(true);

    try {
      // Pastikan penulisan hanya terjadi dari sesi admin yang sudah login.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Sesi login tidak valid. Silakan masuk kembali.");
      }

      const version = Math.floor(Date.now() / 1000);

      const { data, error } = await supabase
        .from("session_control")
        .update({
          ...patch,
          version,
          updated_by: "web",
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      if (data) setControl(data as SessionControlRow);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return (
    <SessionControlContext.Provider
      value={{ control, isLoading, isSaving, updateControl }}
    >
      {children}
    </SessionControlContext.Provider>
  );
}

export function useSessionControl() {
  return useContext(SessionControlContext);
}
