"use client";

import { cn } from "@/lib/utils";
import { useTelemetry } from "@/lib/hooks/use-telemetry";
import { getProcessPhase, WATER_MIN } from "@/lib/process-config";

function safeNum(val: unknown, fallback: number): number {
  if (val === null || val === undefined || val === "") return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function formatTime(seconds: number) {
  const sSafe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(sSafe / 3600);
  const m = Math.floor((sSafe % 3600) / 60);
  const s = sSafe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function MetricsRow() {
  const {
    telemetry,
    remainingSeconds,
    isDeviceOnline,
    hasDevicePresence,
    hasReceivedData,
    isStandby,
    displayWaterLevel,
    displayMachineStatus,
  } = useTelemetry();

  const tempActual = safeNum(telemetry?.temp_actual, 30.0);
  const tempPt1 = safeNum(telemetry?.temp_pt100_1, 30.8);
  const tempPt2 = safeNum(telemetry?.temp_pt100_2, 29.7);
  const tempTarget = safeNum(telemetry?.temp_target, 100.0);

  const waterValid = displayWaterLevel !== null;
  const waterLevel = displayWaterLevel ?? 0;
  const waterLow = waterValid && waterLevel < WATER_MIN;

  const phase =
    displayMachineStatus === "Sedang Proses"
      ? getProcessPhase(telemetry)
      : null;

  const isMuted = !isDeviceOnline;
  const shownRemainingSeconds = isStandby ? 0 : remainingSeconds;
  const standbySubtext =
    displayMachineStatus === "Selesai"
      ? "Sesi selesai"
      : "Menunggu sesi dimulai";
  const showTempDash = isStandby || !hasReceivedData;

  const tempSubtext = isStandby
    ? standbySubtext
    : !hasReceivedData
      ? "Menunggu data telemetri"
      : isDeviceOnline
        ? `PT100-1 ${tempPt1.toFixed(1)}°C · PT100-2 ${tempPt2.toFixed(1)}°C`
        : "Data terakhir";

  const waterSubtext = !isDeviceOnline
    ? waterValid
      ? "Data terakhir"
      : "Menunggu data level air"
    : !waterValid
      ? "Menunggu data level air"
      : waterLow
        ? "Level air rendah"
        : "Normal";

  const timerSubtitle = isStandby
    ? standbySubtext
    : isMuted
      ? hasReceivedData
        ? "Data terakhir"
        : "Menunggu data telemetri"
      : phase?.key === "ignition"
        ? "Menunggu verifikasi api"
        : phase
          ? "Timer berjalan"
          : displayMachineStatus;

  const targetSubtext = isStandby
    ? standbySubtext
    : !hasReceivedData
      ? "Menunggu data telemetri"
      : isMuted
        ? "Data terakhir"
        : `Selisih ${Math.abs(tempActual - tempTarget).toFixed(1)}°C · Normal`;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Metric 1: Suhu Aktual */}
      <div
        className={cn(
          "p-6 rounded-3xl shadow-sm flex flex-col justify-between h-[164px] relative transition-colors",
          isMuted ? "bg-[#B9BDB1] text-white/75" : "bg-[#617438] text-white"
        )}
      >
        {hasDevicePresence && (
          <div
            className={cn(
              "absolute top-3 right-3 w-2 h-2 rounded-full",
              isDeviceOnline ? "bg-green-400 animate-pulse" : "bg-[#E8A79F]"
            )}
          />
        )}
        <h3 className={cn("text-sm font-medium", isMuted ? "text-white/70" : "text-white/90")}>
          Suhu Aktual
        </h3>
        <div className="flex items-baseline">
          <span className="text-5xl font-bold tracking-tight">
            {showTempDash ? "—" : tempActual.toFixed(1)}
          </span>
          <span className="text-2xl font-light ml-1">°C</span>
        </div>
        <p
          className={cn(
            "text-xs font-normal tracking-wide",
            isMuted ? "text-white/60" : "text-white/80"
          )}
        >
          {tempSubtext}
        </p>
      </div>

      {/* Metric 2: Suhu Target */}
      <div className="custom-card p-6 shadow-sm flex flex-col justify-between h-[164px]">
        <h3 className="text-gray-600 text-sm font-medium">Suhu Target</h3>
        <div className="flex items-baseline text-neutral-800">
          <span className="text-5xl font-bold tracking-tight">
            {Math.round(tempTarget)}
          </span>
          <span className="text-2xl font-light ml-1 text-gray-500">°C</span>
        </div>
        <p className="text-xs text-gray-500 font-normal">{targetSubtext}</p>
      </div>

      {/* Metric 3: Level Air */}
      <div
        className={cn(
          "custom-card p-6 shadow-sm flex flex-col justify-between h-[164px] transition-colors",
          isMuted && "bg-[#EFEFEA]"
        )}
      >
        <h3 className={cn("text-sm font-medium", isMuted ? "text-gray-400" : "text-gray-600")}>
          Level Air
        </h3>
        <div
          className={cn(
            "flex items-baseline",
            isMuted ? "text-gray-400" : "text-neutral-800"
          )}
        >
          <span className="text-5xl font-bold tracking-tight">
            {waterValid ? Math.round(waterLevel) : "—"}
          </span>
          {waterValid && (
            <span className="text-2xl font-normal ml-0.5 text-gray-500">%</span>
          )}
        </div>
        <div>
          <div className="h-1.5 w-full rounded-full bg-[#E8EAE2] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                isMuted ? "bg-[#A9AD9F]" : waterLow ? "bg-[#D96B60]" : "bg-[#6E8143]"
              )}
              style={{ width: `${waterValid ? Math.min(100, Math.max(0, waterLevel)) : 0}%` }}
            />
          </div>
          <p
            className={cn(
              "text-xs font-normal mt-1.5",
              isMuted
                ? "text-gray-400"
                : !waterValid || waterLow
                  ? "text-[#D96B60]"
                  : "text-gray-500"
            )}
          >
            {waterSubtext}
          </p>
        </div>
      </div>

      {/* Metric 4: Sisa Waktu */}
      <div
        className={cn(
          "custom-card p-6 shadow-sm flex flex-col justify-between h-[164px] transition-colors",
          isMuted && "bg-[#EFEFEA]"
        )}
      >
        <h3 className={cn("text-sm font-medium", isMuted ? "text-gray-400" : "text-gray-600")}>
          Sisa Waktu
        </h3>
        <div
          className={cn(
            "flex items-baseline",
            isMuted ? "text-gray-400" : "text-[#546430]"
          )}
        >
          <span className="text-4xl lg:text-[2.6rem] font-bold tracking-tight font-mono">
            {formatTime(shownRemainingSeconds)}
          </span>
        </div>
        <p className="text-xs text-gray-500 font-normal">{timerSubtitle}</p>
      </div>
    </section>
  );
}
