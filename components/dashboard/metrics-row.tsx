"use client";

import { useTelemetry } from "@/lib/hooks/use-telemetry";

function safeNum(val: unknown, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export function MetricsRow() {
  const { telemetry, isConnected } = useTelemetry();

  // Format remaining time (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const sSafe = Math.max(0, Math.floor(seconds));
    const h = Math.floor(sSafe / 3600);
    const m = Math.floor((sSafe % 3600) / 60);
    const s = sSafe % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Selalu fallback ke default jika null / undefined / NaN
  const tempActual = safeNum(telemetry?.temp_actual, 30.0);
  const tempPt1    = safeNum(telemetry?.temp_pt100_1, 30.8);
  const tempPt2    = safeNum(telemetry?.temp_pt100_2, 29.7);
  const tempTarget = safeNum(telemetry?.temp_target, 70.0);
  const waterLevel = safeNum(telemetry?.water_level, 50.0);
  const remaining  = safeNum(telemetry?.remaining_time_seconds, 0);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Metric 1: Suhu Aktual (Olive Green Card) */}
      <div className="bg-[#617438] text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between h-[164px] relative">
        {isConnected && (
          <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        )}
        <h3 className="text-white/90 text-sm font-medium">Suhu Aktual</h3>
        <div className="flex items-baseline">
          <span className="text-5xl font-bold tracking-tight">
            {tempActual.toFixed(1)}
          </span>
          <span className="text-2xl font-light ml-1">°C</span>
        </div>
        <p className="text-xs text-white/80 font-normal tracking-wide">
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
      <div className="custom-card p-6 shadow-sm flex flex-col justify-between h-[164px]">
        <h3 className="text-gray-600 text-sm font-medium">Level Air</h3>
        <div className="flex items-baseline text-neutral-800">
          <span className="text-5xl font-bold tracking-tight">
            {Math.round(waterLevel)}
          </span>
          <span className="text-2xl font-normal ml-0.5 text-gray-500">%</span>
        </div>
        <p className="text-xs text-gray-500 font-normal">Normal</p>
      </div>

      {/* Metric 4: Sisa Waktu */}
      <div className="custom-card p-6 shadow-sm flex flex-col justify-between h-[164px]">
        <h3 className="text-gray-600 text-sm font-medium">Sisa Waktu</h3>
        <div className="flex items-baseline text-[#546430]">
          <span className="text-4xl lg:text-[2.6rem] font-bold tracking-tight font-mono">
            {formatTime(remaining)}
          </span>
        </div>
        <p className="text-xs text-gray-500 font-normal">{telemetry?.machine_status || "Siap"}</p>
      </div>
    </section>
  );
}
