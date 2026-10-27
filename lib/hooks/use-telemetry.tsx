"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { parseStandbyWaterLevel } from "@/lib/process-config";
import { supabase } from "@/lib/supabase";
import { useSessionControl } from "@/lib/hooks/use-session-control";

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

/** ESP32 dianggap online jika aktivitas terakhir <= 25 detik. */
const DEVICE_PRESENCE_TIMEOUT_MS = 25_000;
/** Timer lokal hanya jalan saat telemetri masih segar (kiriman tiap 2 detik). */
const TELEMETRY_STALE_MS = 8_000;
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

function parseValidTimestamp(value: unknown): Date | null {
  const parsed = new Date(String(value ?? ""));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseTimestamp(value: unknown): Date {
  return parseValidTimestamp(value) ?? new Date();
}

function latestDate(a: Date | null, b: Date | null): Date | null {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() >= b.getTime() ? a : b;
}

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
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
  /** True jika tidak ada aktivitas perangkat dalam 25 detik terakhir. */
  isOffline: boolean;
  isDeviceOnline: boolean;
  /** True setelah web pernah menerima timestamp perangkat. */
  hasDevicePresence: boolean;
  /** Timestamp aktivitas terbaru dari telemetry atau heartbeat `device:*`. */
  lastDeviceSeenAt: Date | null;
  /** False sampai row telemetri pertama diterima. */
  hasReceivedData: boolean;
  lastTelemetryAt: Date | null;
  /** Online dan session_control berstatus idle/stopped. */
  isStandby: boolean;
  /** Level air dari heartbeat `device:idle:<level>`, jika ada. */
  standbyWaterLevel: number | null;
  /** Level air yang ditampilkan: heartbeat standby atau telemetry. */
  displayWaterLevel: number | null;
  /** Status mesin yang sudah memperhitungkan koneksi dan status standby. */
  displayMachineStatus: MachineStatus;
}

const TelemetryContext = createContext<TelemetryContextType>({
  telemetry: DEFAULT_TELEMETRY,
  historyPoints: [],
  isConnected: false,
  remainingSeconds: 0,
  isOffline: true,
  isDeviceOnline: false,
  hasDevicePresence: false,
  lastDeviceSeenAt: null,
  hasReceivedData: false,
  lastTelemetryAt: null,
  isStandby: false,
  standbyWaterLevel: null,
  displayWaterLevel: null,
  displayMachineStatus: "Mesin Mati",
});

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const { control } = useSessionControl();
  const [telemetry, setTelemetry] = useState<TelemetryData>(DEFAULT_TELEMETRY);
  const [historyPoints, setHistoryPoints] = useState<HistoryPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const [hasReceivedData, setHasReceivedData] = useState(false);
  const [lastTelemetryAt, setLastTelemetryAt] = useState<Date | null>(null);

  const telemetryRef = useRef<TelemetryData>(DEFAULT_TELEMETRY);
  const lastTelemetryAtRef = useRef<Date | null>(null);
  const lastDeviceSeenAtRef = useRef<Date | null>(null);
  const controlStatusRef = useRef<string | null>(null);

  // Aktivitas dari session_control hanya dihitung jika ditulis perangkat.
  // PATCH dari web tidak boleh membuat ESP32 terlihat online.
  useEffect(() => {
    controlStatusRef.current = control?.status ?? null;

    if (!control?.updated_by?.startsWith("device")) return;

    const seenAt = parseValidTimestamp(control.updated_at);
    if (
      seenAt &&
      (!lastDeviceSeenAtRef.current || seenAt > lastDeviceSeenAtRef.current)
    ) {
      lastDeviceSeenAtRef.current = seenAt;
    }
  }, [control?.status, control?.updated_at, control?.updated_by]);

  useEffect(() => {
    let isMounted = true;

    function applyTelemetry(row: TelemetryData) {
      telemetryRef.current = row;

      const receivedAt = parseTimestamp(row.timestamp);

      if (
        !lastTelemetryAtRef.current ||
        receivedAt > lastTelemetryAtRef.current
      ) {
        lastTelemetryAtRef.current = receivedAt;
        setLastTelemetryAt(receivedAt);
      }

      if (
        !lastDeviceSeenAtRef.current ||
        receivedAt > lastDeviceSeenAtRef.current
      ) {
        lastDeviceSeenAtRef.current = receivedAt;
      }

      if (
        Date.now() - receivedAt.getTime() <= DEVICE_PRESENCE_TIMEOUT_MS
      ) {
        setIsDeviceOnline(true);
      }

      setTelemetry(row);
      setHasReceivedData(true);

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
          timestamp: parseTimestamp(row.timestamp),
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

  // 3. Tick lokal 1 detik: timer hybrid + deteksi online/offline.
  useEffect(() => {
    const interval = setInterval(() => {
      const seenAt = lastDeviceSeenAtRef.current;
      const online =
        !!seenAt &&
        Date.now() - seenAt.getTime() <= DEVICE_PRESENCE_TIMEOUT_MS;

      setIsDeviceOnline((prev) => (prev === online ? prev : online));

      if (!online) return;

      // Timer hanya boleh jalan saat sesi aktif dan telemetri masih segar.
      const lastTelemetry = lastTelemetryAtRef.current;
      const telemetryFresh =
        !!lastTelemetry &&
        Date.now() - lastTelemetry.getTime() <= TELEMETRY_STALE_MS;

      if (!telemetryFresh) return;

      const controlStatus = controlStatusRef.current;
      if (
        controlStatus === "idle" ||
        controlStatus === "stopped" ||
        controlStatus === "paused"
      ) {
        return;
      }

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

  const lastControlSeenAt =
    control?.updated_by?.startsWith("device") && control.updated_at
      ? parseValidTimestamp(control.updated_at)
      : null;
  const lastDeviceSeenAt = latestDate(lastTelemetryAt, lastControlSeenAt);
  const hasDevicePresence = lastDeviceSeenAt !== null;
  const isOffline = !isDeviceOnline;
  const isStandby =
    isDeviceOnline &&
    (control?.status === "idle" || control?.status === "stopped");
  const standbyWaterLevel = parseStandbyWaterLevel(control?.updated_by);
  const telemetryWaterLevel = hasReceivedData
    ? toFiniteNumber(telemetry?.water_level)
    : null;
  const displayWaterLevel = isStandby
    ? (standbyWaterLevel ?? telemetryWaterLevel)
    : telemetryWaterLevel;

  let displayMachineStatus: MachineStatus =
    telemetry.machine_status || "Mesin Siap";

  if (!isDeviceOnline) {
    displayMachineStatus = "Mesin Mati";
  } else if (control?.status === "idle") {
    displayMachineStatus = "Mesin Siap";
  } else if (control?.status === "paused") {
    displayMachineStatus = "Jeda";
  } else if (control?.status === "stopped") {
    displayMachineStatus =
      telemetry.machine_status === "Selesai" ? "Selesai" : "Mesin Siap";
  } else if (
    control?.status === "running" &&
    (telemetry.machine_status === "Mesin Siap" ||
      telemetry.machine_status === "Selesai")
  ) {
    displayMachineStatus = "Sedang Proses";
  }

  return (
    <TelemetryContext.Provider
      value={{
        telemetry,
        historyPoints,
        isConnected,
        remainingSeconds,
        isOffline,
        isDeviceOnline,
        hasDevicePresence,
        lastDeviceSeenAt,
        hasReceivedData,
        lastTelemetryAt,
        isStandby,
        standbyWaterLevel,
        displayWaterLevel,
        displayMachineStatus,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  return useContext(TelemetryContext);
}
