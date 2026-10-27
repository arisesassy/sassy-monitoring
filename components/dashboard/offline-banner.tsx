"use client";

import { useTelemetry } from "@/lib/hooks/use-telemetry";

export function OfflineBanner() {
  const { isOffline, hasReceivedData, lastTelemetryAt } = useTelemetry();

  if (hasReceivedData && !isOffline) return null;

  const lastTime = lastTelemetryAt
    ? lastTelemetryAt.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div
      role="status"
      className="w-full flex items-center gap-3 rounded-2xl border border-[#E9C3BC] bg-[#FDF1EE] px-4 py-3 text-[#9C4A3F]"
    >
      <span className="w-2.5 h-2.5 rounded-full bg-[#D96B60] shrink-0" />
      <p className="text-xs sm:text-sm font-semibold">
        {hasReceivedData && isOffline
          ? `ESP32 Terputus — menampilkan data terakhir pukul ${lastTime}`
          : "Menunggu data telemetri dari ESP32…"}
      </p>
    </div>
  );
}
