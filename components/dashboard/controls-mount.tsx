"use client";

import { useSessionControl } from "@/lib/hooks/use-session-control";
import { ControlsSection } from "./controls-section";

/**
 * Remount ControlsSection hanya saat field form berubah. Heartbeat standby
 * ikut memperbarui updated_at tiap 10 detik, jadi updated_at tidak boleh
 * dipakai sebagai key karena akan mereset pilihan operator.
 */
export function ControlsMount() {
  const { control } = useSessionControl();

  const formKey = control
    ? [
        control.status,
        control.material_type ?? "",
        control.duration_minutes ?? "",
        control.target_temp ?? "",
      ].join("|")
    : "initial";

  return <ControlsSection key={formKey} />;
}
