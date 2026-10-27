"use client";

import { useSessionControl } from "@/lib/hooks/use-session-control";
import { ControlsSection } from "./controls-section";

/**
 * Remount ControlsSection setiap session_control berubah supaya nilai form
 * tersinkron dengan server tanpa setState di dalam effect.
 */
export function ControlsMount() {
  const { control } = useSessionControl();

  return <ControlsSection key={control?.updated_at ?? "initial"} />;
}
