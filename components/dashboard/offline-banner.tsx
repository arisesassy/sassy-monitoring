"use client";

import { useTelemetry } from "@/lib/hooks/use-telemetry";

export function OfflineBanner() {
  const { isDeviceOnline, hasDevicePresence, lastDeviceSeenAt } =
    useTelemetry();

  const lastTime = lastDeviceSeenAt
    ? lastDeviceSeenAt.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  if (isDeviceOnline) {
    return (
      <div
        role="status"
        className="w-full flex items-center gap-3 rounded-2xl border border-[#D7DCCB] bg-[#F5F7EE] px-4 py-2.5 text-[#556434]"
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6E8143] opacity-50" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#6E8143]" />
        </span>
        <p className="text-xs sm:text-sm font-semibold">ESP32 Terhubung</p>
        <span className="ml-auto hidden text-[10px] font-medium uppercase tracking-[0.12em] text-[#6E8143]/70 sm:inline">
          Heartbeat aktif
        </span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="w-full flex items-center gap-3 rounded-2xl border border-[#E9C3BC] bg-[#FDF1EE] px-4 py-3 text-[#9C4A3F]"
    >
      <span className="w-2.5 h-2.5 rounded-full bg-[#D96B60] shrink-0" />
      <p className="text-xs sm:text-sm font-semibold">
        {hasDevicePresence && lastTime
          ? `ESP32 Terputus — heartbeat terakhir pukul ${lastTime}`
          : "ESP32 Terputus — belum ada heartbeat"}
      </p>
    </div>
  );
}
