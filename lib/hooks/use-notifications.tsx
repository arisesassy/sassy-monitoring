"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTelemetry } from "@/lib/hooks/use-telemetry";

export type AppNotificationType = "warn" | "info" | "error";

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  text: string;
  createdAt: Date;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  dismiss: (id: string) => void;
  clearLowWater: () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  dismiss: () => {},
  clearLowWater: () => {},
});

const LOW_WATER_THRESHOLD = 25;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { telemetry } = useTelemetry();
  const [lowWaterLatched, setLowWaterLatched] = useState(false);
  const [lowWaterAt, setLowWaterAt] = useState<Date | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const suppressUntilRefillRef = useRef(false);

  const waterLevel = Number(telemetry?.water_level);
  const isPausedByWater = telemetry?.machine_status === "Jeda";

  useEffect(() => {
    if (!Number.isFinite(waterLevel)) return;

    // Air sudah diisi ulang -> arm kembali untuk peringatan berikutnya.
    if (waterLevel > LOW_WATER_THRESHOLD) {
      suppressUntilRefillRef.current = false;
      return;
    }

    if (waterLevel <= LOW_WATER_THRESHOLD && !suppressUntilRefillRef.current) {
      setLowWaterLatched(true);
      setLowWaterAt((prev) => prev ?? new Date());
    }
  }, [waterLevel]);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  const clearLowWater = useCallback(() => {
    // Dipanggil saat operator menekan "Mulai".
    setLowWaterLatched(false);
    setLowWaterAt(null);
    suppressUntilRefillRef.current = true;
    setDismissed((prev) => {
      const next = new Set(prev);
      next.delete("low-water");
      return next;
    });
  }, []);

  const notifications = useMemo<AppNotification[]>(() => {
    const active: AppNotification[] = [];

    if (lowWaterLatched) {
      active.push({
        id: "low-water",
        type: "warn",
        text: isPausedByWater
          ? "Level air rendah, mesin dijeda otomatis"
          : "Level air rendah, mesin akan dijeda otomatis",
        createdAt: lowWaterAt ?? new Date(),
      });
    }

    return active.filter((n) => !dismissed.has(n.id));
  }, [dismissed, isPausedByWater, lowWaterAt, lowWaterLatched]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount: notifications.length,
        dismiss,
        clearLowWater,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
