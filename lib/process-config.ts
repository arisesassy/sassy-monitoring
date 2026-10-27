export type MaterialType = "Kain" | "Kulit";

export const MATERIAL_PROFILES: Record<
  MaterialType,
  { label: MaterialType; targetTemp: number }
> = {
  Kain: { label: "Kain", targetTemp: 100 },
  Kulit: { label: "Kulit", targetTemp: 60 },
};

export const MATERIAL_OPTIONS: MaterialType[] = ["Kain", "Kulit"];

export const DURATION_MIN = 60;
export const DURATION_MAX = 120;
export const DURATION_STEP = 5;

/** Ambang batas aman level air. Blokir Mulai/Lanjut jika di bawah nilai ini. */
export const WATER_MIN = 25;

export function normalizeMaterial(value: unknown): MaterialType {
  return String(value ?? "").trim().toLowerCase() === "kulit"
    ? "Kulit"
    : "Kain";
}

export function getTargetTemp(material: MaterialType): number {
  return MATERIAL_PROFILES[material].targetTemp;
}

export function isValidDuration(value: number): boolean {
  return (
    Number.isInteger(value) && value >= DURATION_MIN && value <= DURATION_MAX
  );
}

export function formatWaterLevel(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `${Number.isInteger(numeric) ? numeric : numeric.toFixed(1)}%`;
}

/**
 * Heartbeat standby ESP32 menulis `updated_by` berformat `device:idle:<level>`.
 * Nilai ini adalah sumber level air real-time saat mesin idle/stopped dan
 * sengaja tidak membuat row baru di tabel telemetry.
 */
export function parseStandbyWaterLevel(
  updatedBy: string | null | undefined
): number | null {
  if (!updatedBy) return null;

  const match = /^device:idle:(\d+)$/.exec(updatedBy);
  if (!match) return null;

  const level = Number(match[1]);
  return Number.isFinite(level) && level >= 0 && level <= 100 ? level : null;
}

export type ProcessPhaseKey = "ignition" | "heating" | "stable";

export interface ProcessPhase {
  key: ProcessPhaseKey;
  label: string;
}

interface ProcessPhaseTelemetry {
  machine_status?: string | null;
  burner1_active?: boolean | null;
  burner2_active?: boolean | null;
  temp_actual?: number | string | null;
  temp_target?: number | string | null;
}

/**
 * Fase hanya berlaku saat mesin Sedang Proses.
 * Timer lokal tidak boleh berjalan saat fase ignition.
 */
export function getProcessPhase(
  telemetry: ProcessPhaseTelemetry | null | undefined
): ProcessPhase | null {
  if (!telemetry || telemetry.machine_status !== "Sedang Proses") {
    return null;
  }

  if (!telemetry.burner1_active || !telemetry.burner2_active) {
    return {
      key: "ignition",
      label: "Memantik & Verifikasi Api (Maks 10 dtk)",
    };
  }

  const actual = Number(telemetry.temp_actual);
  const target = Number(telemetry.temp_target);
  const difference =
    Number.isFinite(actual) && Number.isFinite(target)
      ? Math.abs(actual - target)
      : Number.POSITIVE_INFINITY;

  if (difference > 2) {
    return {
      key: "heating",
      label: "Pemanasan Menuju Target (PID Aktif)",
    };
  }

  return {
    key: "stable",
    label: "Suhu Stabil — Pengukusan Berjalan",
  };
}

export type PauseAlertType = "warn" | "info";

export interface PauseAlert {
  key: string;
  type: PauseAlertType;
  text: string;
}

const PAUSE_ALERTS: Record<string, PauseAlert> = {
  "device:low_water": {
    key: "device:low_water",
    type: "warn",
    text: "Level Air Tidak Mencukupi (<25%) — Jalur gas dikunci tertutup (0%). Isi air terlebih dahulu sebelum klik Lanjut.",
  },
  "device:ign_fail": {
    key: "device:ign_fail",
    type: "warn",
    text: "Gagal Menyalakan Api (Timeout 10 Detik) — Kedua burner tidak terdeteksi aktif. Jalur gas telah ditutup rapat (0%). Periksa gas & pemantik sebelum klik Lanjut atau Stop/Reset.",
  },
  "device:flame_out": {
    key: "device:flame_out",
    type: "warn",
    text: "Api Kompor Padam Saat Proses! — Jalur gas telah ditutup rapat (0%) demi keamanan. Periksa kompor sebelum klik Lanjut.",
  },
  "device:manual": {
    key: "device:manual",
    type: "info",
    text: "Jeda Manual dari Perangkat",
  },
  web: {
    key: "web",
    type: "info",
    text: "Jeda Manual dari Dashboard",
  },
};

const GENERIC_PAUSE_ALERT: PauseAlert = {
  key: "generic",
  type: "info",
  text: "Mesin dijeda. Periksa kondisi alat sebelum melanjutkan.",
};

export function getPauseAlert(reason: string | null | undefined): PauseAlert {
  if (!reason) return GENERIC_PAUSE_ALERT;
  return PAUSE_ALERTS[reason] ?? GENERIC_PAUSE_ALERT;
}
