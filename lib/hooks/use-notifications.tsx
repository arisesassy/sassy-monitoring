"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useTelemetry } from "@/lib/hooks/use-telemetry";
import { useSessionControl } from "@/lib/hooks/use-session-control";
import { getPauseAlert, WATER_MIN } from "@/lib/process-config";

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

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { telemetry } = useTelemetry();
  const { control } = useSessionControl();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const waterLevel = Number(telemetry?.water_level);
  const waterLow = Number.isFinite(waterLevel) && waterLevel < WATER_MIN;

  const isPaused =
    control?.status === "paused" || telemetry?.machine_status === "Jeda";
  const pauseReason =
    control?.status === "paused" ? control.updated_by : null;
  const pauseAlert = isPaused ? getPauseAlert(pauseReason) : null;

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  const clearLowWater = useCallback(() => {
    // Dipanggil saat operator menekan Mulai/Lanjut/Stop.
    setDismissed((prev) => {
      const next = new Set(prev);
      next.delete("low-water");
      return next;
    });
  }, []);

  const notifications: AppNotification[] = [];
  const telemetryAt = telemetry?.timestamp
    ? new Date(telemetry.timestamp)
    : new Date();

  // Pause karena low water sudah diwakili oleh alert device yang lebih presisi.
  if (waterLow && pauseAlert?.key !== "device:low_water") {
    notifications.push({
      id: "low-water",
      type: "warn",
      text: "Level air rendah (<25%), mesin akan dijeda otomatis",
      createdAt: telemetryAt,
    });
  }

  if (pauseAlert) {
    notifications.push({
      id: `pause-${control?.updated_at ?? telemetry?.timestamp ?? "current"}`,
      type: pauseAlert.type,
      text: pauseAlert.text,
      createdAt:
        control?.status === "paused" && control.updated_at
          ? new Date(control.updated_at)
          : telemetryAt,
    });
  }

  const visibleNotifications = notifications.filter(
    (notification) => !dismissed.has(notification.id)
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications: visibleNotifications,
        unreadCount: visibleNotifications.length,
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
