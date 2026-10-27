"use client";

import { cn } from "@/lib/utils";
import { getPauseAlert } from "@/lib/process-config";
import { useSessionControl } from "@/lib/hooks/use-session-control";
import { useTelemetry } from "@/lib/hooks/use-telemetry";

export function DeviceAlertBanner() {
  const { telemetry } = useTelemetry();
  const { control } = useSessionControl();

  const isControlPaused = control?.status === "paused";
  const isTelemetryPaused = telemetry?.machine_status === "Jeda";

  if (!isControlPaused && !isTelemetryPaused) return null;

  // Alasan presisi hanya ditulis perangkat saat status paused.
  const alert = getPauseAlert(
    isControlPaused ? control?.updated_by ?? null : null
  );

  const isWarn = alert.type === "warn";
  const updatedAt =
    isControlPaused && control?.updated_at
      ? new Date(control.updated_at)
      : null;
  const updatedTime =
    updatedAt && !Number.isNaN(updatedAt.getTime())
      ? updatedAt.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : null;

  return (
    <div
      role={isWarn ? "alert" : "status"}
      className={cn(
        "w-full rounded-2xl border px-4 py-3.5",
        isWarn
          ? "border-[#E9C3BC] bg-[#FDF1EE] text-[#9C4A3F]"
          : "border-[#D7DCCB] bg-[#F5F7EE] text-[#556434]"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
            isWarn ? "bg-[#D96B60]" : "bg-[#6E8143]"
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
              {isWarn ? "Peringatan Keselamatan" : "Informasi Jeda"}
            </p>
            {updatedTime && (
              <span className="text-[10px] font-medium opacity-70">
                sejak {updatedTime}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-semibold leading-relaxed sm:text-sm">
            {alert.text}
          </p>
        </div>
      </div>
    </div>
  );
}
