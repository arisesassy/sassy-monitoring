"use client";

import { cn } from "@/lib/utils";
import { useTelemetry } from "@/lib/hooks/use-telemetry";
import { getProcessPhase, WATER_MIN } from "@/lib/process-config";

function safeNum(val: unknown, fallback: number): number {
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
  const { telemetry, remainingSeconds, isOffline, hasReceivedData } =
    useTelemetry();

  const tempActual = safeNum(telemetry?.temp_actual, 30.0);
  const tempPt1 = safeNum(telemetry?.temp_pt100_1, 30.8);
  const tempPt2 = safeNum(telemetry?.temp_pt100_2, 29.7);
  const tempTarget = safeNum(telemetry?.temp_target, 100.0);
  const waterLevel = safeNum(telemetry?.water_level, 50.0);
  const waterLow = waterLevel < WATER_MIN;
  const phase = getProcessPhase(telemetry);

  const isMuted = hasReceivedData && isOffline;
  const timerSubtitle = isMuted
    ? "Data terakhir"
    : phase?.key === "ignition"
      ? "Menunggu verifikasi api"
      : phase
        ? "Timer berjalan"
        : telemetry?.machine_status || "Mesin Siap";

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Metric 1: Suhu Aktual */}
      <div
        className={cn(
          "p-6 rounded-3xl shadow-sm flex flex-col justify-between h-[164px] relative transition-colors",
          isMuted ? "bg-[#B9BDB1] text-white/75" : "bg-[#617438] text-white"
        )}
      >
        {hasReceivedData && (
          <div
            className={cn(
              "absolute top-3 right-3 w-2 h-2 rounded-full",
              isOffline ? "bg-[#E8A79F]" : "bg-green-400 animate-pulse"
            )}
          />
        )}
        <h3 className={cn("text-sm font-medium", isMuted ? "text-white/70" : "text-white/90")}>
          Suhu Aktual
        </h3>
        <div className="flex items-baseline">
          <span className="text-5xl font-bold tracking-tight">
            {tempActual.toFixed(1)}
          </span>
          <span className="text-2xl font-light ml-1">°C</span>
        </div>
        <p
          className={cn(
            "text-xs font-normal tracking-wide",
            isMuted ? "text-white/60" : "text-white/80"
          )}
        >
          PT100-1 {tempPt1.toFixed(1)}°C · PT100-2 {tempPt2.toFixed(1)}°C
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
        <p className="text-xs text-gray-500 font-normal">
          Selisih {Math.abs(tempActual - tempTarget).toFixed(1)}°C · Normal
        </p>
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
            {Math.round(waterLevel)}
          </span>
          <span className="text-2xl font-normal ml-0.5 text-gray-500">%</span>
        </div>
        <div>
          <div className="h-1.5 w-full rounded-full bg-[#E8EAE2] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                isMuted ? "bg-[#A9AD9F]" : waterLow ? "bg-[#D96B60]" : "bg-[#6E8143]"
              )}
              style={{ width: `${Math.min(100, Math.max(0, waterLevel))}%` }}
            />
          </div>
          <p
            className={cn(
              "text-xs font-normal mt-1.5",
              isMuted ? "text-gray-400" : waterLow ? "text-[#D96B60]" : "text-gray-500"
            )}
          >
            {waterLow ? "Level air rendah" : "Normal"}
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
            {formatTime(remainingSeconds)}
          </span>
        </div>
        <p className="text-xs text-gray-500 font-normal">{timerSubtitle}</p>
      </div>
    </section>
  );
}
