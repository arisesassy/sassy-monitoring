"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface TelemetryData {
  id?: number;
  session_id: string;
  timestamp: string;
  temp_actual: number;
  temp_pt100_1: number;
  temp_pt100_2: number;
  temp_target: number;
  water_level: number;
  process_progress: number;
  remaining_time_seconds: number;
  machine_status: string;
  burner1_active: boolean;
  burner2_active: boolean;
  pid_output_percent: number;
  material_type: string;
  duration_minutes: number;
  flip_roll_interval_minutes: number;
}

const DEFAULT_TELEMETRY: TelemetryData = {
  session_id: "INIT",
  timestamp: new Date().toISOString(),
  temp_actual: 30.0,
  temp_pt100_1: 30.8,
  temp_pt100_2: 29.7,
  temp_target: 70.0,
  water_level: 50.0,
  process_progress: 0.0,
  remaining_time_seconds: 0,
  machine_status: "Siap",
  burner1_active: true,
  burner2_active: false,
  pid_output_percent: 36.0,
  material_type: "Kain",
  duration_minutes: 120,
  flip_roll_interval_minutes: 30,
};

interface TelemetryContextType {
  telemetry: TelemetryData;
  historyPoints: { time: string; temp: number; target: number }[];
  isConnected: boolean;
}

const TelemetryContext = createContext<TelemetryContextType>({
  telemetry: DEFAULT_TELEMETRY,
  historyPoints: [],
  isConnected: false,
});

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [telemetry, setTelemetry] = useState<TelemetryData>(DEFAULT_TELEMETRY);
  const [historyPoints, setHistoryPoints] = useState<{ time: string; temp: number; target: number }[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial fetch: ambil record telemetri paling baru
    async function fetchLatest() {
      const { data, error } = await supabase
        .from("telemetry")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("[useTelemetry] fetchLatest error:", error.message, error);
      }

      if (!error && data && isMounted) {
        setTelemetry(data as TelemetryData);
        setHistoryPoints((prev) => [
          ...prev,
          {
            time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            temp: Number(data.temp_actual),
            target: Number(data.temp_target),
          },
        ]);
      }
    }

    fetchLatest();

    // 2. Realtime subscription: single channel dengan unique ID per session
    // ponytail: single channel context, upgrade to room channel when multiple steamer units exist
    const channelName = `realtime-telemetry-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "telemetry",
        },
        (payload) => {
          if (!isMounted) return;
          console.log("[useTelemetry] Realtime INSERT received:", payload.new);
          const newData = payload.new as TelemetryData;
          setTelemetry(newData);
          setHistoryPoints((prev) => {
            const next = [
              ...prev,
              {
                time: new Date(newData.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                temp: Number(newData.temp_actual),
                target: Number(newData.temp_target),
              },
            ];
            return next.slice(-30);
          });
        }
      )
      .subscribe((status, err) => {
        console.log(`[useTelemetry] Realtime status: ${status}`, err || "");
        if (isMounted) setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <TelemetryContext.Provider value={{ telemetry, historyPoints, isConnected }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  return useContext(TelemetryContext);
}
