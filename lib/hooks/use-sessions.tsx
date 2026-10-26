"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface SessionItem {
  id: string;
  code: string;
  timestamp: string;
  material: "Kain" | "Kulit";
  targetTemp: number;
  durationMinutes: number;
  status: "Selesai" | "Dihentikan";
  started_at?: string;
  ended_at?: string;
}

interface SessionsContextType {
  sessions: SessionItem[];
  isLoading: boolean;
  isConnected: boolean;
}

const SessionsContext = createContext<SessionsContextType>({
  sessions: [],
  isLoading: false,
  isConnected: false,
});

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch semua sessions dari Supabase
    async function fetchSessions() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("started_at", { ascending: false });

      if (error) {
        console.error("[useSessions] fetchSessions error:", error.message);
      }

      if (!error && data && isMounted) {
        const transformed = data.map((row) => ({
          id: String(row.id),
          code: row.session_code,
          timestamp: new Date(row.started_at).toLocaleString("id-ID"),
          material: row.material_type as "Kain" | "Kulit",
          targetTemp: Number(row.target_temp),
          durationMinutes: row.duration_minutes,
          status: row.status as "Selesai" | "Dihentikan",
          started_at: row.started_at,
          ended_at: row.ended_at,
        }));
        setSessions(transformed);
      }
      if (isMounted) setIsLoading(false);
    }

    fetchSessions();

    // 2. Realtime subscription untuk sessions
    const channelName = `realtime-sessions-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "sessions",
        },
        () => {
          if (isMounted) fetchSessions();
        }
      )
      .subscribe((status, err) => {
        console.log(`[useSessions] Realtime status: ${status}`, err || "");
        if (isMounted) setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SessionsContext.Provider value={{ sessions, isLoading, isConnected }}>
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  return useContext(SessionsContext);
}
