"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export type MachineStatus =
  | "Mesin Mati"
  | "Mesin Siap"
  | "Sedang Proses"
  | "Jeda"
  | "Selesai";

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
  machine_status: MachineStatus;
  burner1_active: boolean;
  burner2_active: boolean;
  pid_output_percent: number;
  material_type: string;
  duration_minutes: number;
}

export interface HistoryPoint {
  timestamp: Date;
  temp: number;
  target: number;
}

const OFFLINE_THRESHOLD_MS = 8_000;
const CHART_WINDOW_MS = 20 * 60 * 1000;
const MAX_HISTORY_POINTS = 600;

function mergeHistoryPoints(
  prev: HistoryPoint[],
  incoming: HistoryPoint[]
): HistoryPoint[] {
  const byTimestamp = new Map<number, HistoryPoint>();

  for (const point of [...prev, ...incoming]) {
    byTimestamp.set(point.timestamp.getTime(), point);
  }

  const cutoff = Date.now() - CHART_WINDOW_MS;

  return Array.from(byTimestamp.values())
    .filter((point) => point.timestamp.getTime() >= cutoff)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .slice(-MAX_HISTORY_POINTS);
}

const DEFAULT_TELEMETRY: TelemetryData = {
  session_id: "INIT",
  timestamp: new Date().toISOString(),
  temp_actual: 30.0,
  temp_pt100_1: 30.8,
  temp_pt100_2: 29.7,
  temp_target: 100.0,
  water_level: 50.0,
  process_progress: 0.0,
  remaining_time_seconds: 0,
  machine_status: "Mesin Siap",
  burner1_active: false,
  burner2_active: false,
  pid_output_percent: 0,
  material_type: "Kain",
  duration_minutes: 60,
};

interface TelemetryContextType {
  telemetry: TelemetryData;
  historyPoints: HistoryPoint[];
  isConnected: boolean;
  /** Sisa waktu yang sudah didecrement lokal + resync dari server. */
  remainingSeconds: number;
  /** True jika row terakhir lebih tua dari 8 detik. */
  isOffline: boolean;
  /** False sampai row telemetri pertama diterima. */
  hasReceivedData: boolean;
  lastTelemetryAt: Date | null;
}

const TelemetryContext = createContext<TelemetryContextType>({
  telemetry: DEFAULT_TELEMETRY,
  historyPoints: [],
  isConnected: false,
  remainingSeconds: 0,
  isOffline: false,
  hasReceivedData: false,
  lastTelemetryAt: null,
});

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [telemetry, setTelemetry] = useState<TelemetryData>(DEFAULT_TELEMETRY);
  const [historyPoints, setHistoryPoints] = useState<HistoryPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [hasReceivedData, setHasReceivedData] = useState(false);
  const [lastTelemetryAt, setLastTelemetryAt] = useState<Date | null>(null);

  const telemetryRef = useRef<TelemetryData>(DEFAULT_TELEMETRY);
  const hasReceivedDataRef = useRef(false);
  const lastTelemetryAtRef = useRef<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    function applyTelemetry(row: TelemetryData) {
      telemetryRef.current = row;
      hasReceivedDataRef.current = true;

      const receivedAt = new Date(row.timestamp);
      lastTelemetryAtRef.current = receivedAt;

      setTelemetry(row);
      setHasReceivedData(true);
      setLastTelemetryAt(receivedAt);

      // Resync timer ke nilai asli dari server setiap row baru masuk.
      setRemainingSeconds(
        Math.max(0, Number(row.remaining_time_seconds) || 0)
      );

      const point: HistoryPoint = {
        timestamp: receivedAt,
        temp: Number(row.temp_actual),
        target: Number(row.temp_target),
      };

      setHistoryPoints((prev) => mergeHistoryPoints(prev, [point]));
    }

    // 1. Initial fetch: status terbaru + riwayat 20 menit terakhir.
    async function fetchInitial() {
      const { data, error } = await supabase
        .from("telemetry")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(MAX_HISTORY_POINTS);

      if (error) {
        console.error("[useTelemetry] fetch error:", error.message, error);
        return;
      }

      if (!data || data.length === 0 || !isMounted) return;

      applyTelemetry(data[0] as TelemetryData);

      const cutoff = Date.now() - CHART_WINDOW_MS;
      const points = data
        .slice()
        .reverse()
        .map((row) => ({
          timestamp: new Date(row.timestamp),
          temp: Number(row.temp_actual),
          target: Number(row.temp_target),
        }))
        .filter((p) => p.timestamp.getTime() >= cutoff);

      setHistoryPoints((prev) => mergeHistoryPoints(prev, points));
    }

    fetchInitial();

    // 2. Realtime subscription.
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
          applyTelemetry(payload.new as TelemetryData);
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

  // 3. Tick lokal 1 detik: timer hybrid + deteksi offline.
  useEffect(() => {
    const interval = setInterval(() => {
      const last = lastTelemetryAtRef.current;
      const offline =
        hasReceivedDataRef.current &&
        (!last || Date.now() - last.getTime() > OFFLINE_THRESHOLD_MS);

      setIsOffline(offline);

      if (!hasReceivedDataRef.current || offline) return;

      // Timer baru berjalan setelah kedua burner terverifikasi aktif.
      // Saat fase pemantikan, nilai dari ESP32 dibiarkan apa adanya.
      const current = telemetryRef.current;
      const bothBurnersActive =
        Boolean(current.burner1_active) && Boolean(current.burner2_active);

      if (
        current.machine_status === "Sedang Proses" &&
        bothBurnersActive
      ) {
        setRemainingSeconds((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TelemetryContext.Provider
      value={{
        telemetry,
        historyPoints,
        isConnected,
        remainingSeconds,
        isOffline,
        hasReceivedData,
        lastTelemetryAt,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  return useContext(TelemetryContext);
}
