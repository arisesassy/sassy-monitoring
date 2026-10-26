"use client";

import { useTelemetry } from "@/lib/hooks/use-telemetry";
import { TemperatureChart } from "./temperature-chart";

function safeNum(val: unknown, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export function ChartsSection() {
  const { telemetry, historyPoints } = useTelemetry();
  const progress = safeNum(telemetry?.process_progress, 0);

  // Hitung stroke-dasharray & stroke-dashoffset untuk busur setengah lingkaran
  const radius = 75;
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - progress / 100);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Temperature vs Time Chart Card */}
      <div className="custom-card lg:col-span-7 p-7 shadow-sm flex flex-col justify-between min-h-[340px]">
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-4">Grafik suhu terhadap waktu (20 menit terakhir)</h2>
          {/* Timeseries Chart */}
          <TemperatureChart data={historyPoints} />
        </div>
        {/* Legend Items */}
        <div className="flex items-center gap-6 mt-4 text-xs font-semibold text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#65763D]"></div>
            <span>Suhu Aktual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#C4D4A8] border-b-2 border-dashed"></div>
            <span>Suhu Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 bg-[#E0E7CF] opacity-30 rounded"></div>
            <span>Target Zone (±2°C)</span>
          </div>
        </div>
      </div>

      {/* Process Progress Radial Gauge */}
      <div className="custom-card lg:col-span-5 p-7 shadow-sm flex flex-col justify-between min-h-[340px]">
        <h2 className="text-base font-semibold text-gray-700">Keseluruhan Proses</h2>
        <div className="relative flex flex-col items-center justify-center my-auto pt-6">
          {/* Semi Circle Svg Chart */}
          <svg className="w-72 h-38 overflow-visible" viewBox="0 0 200 110">
            {/* Background Track (abu-abu/cream) */}
            <path
              d="M 25 100 A 75 75 0 0 1 175 100"
              fill="none"
              stroke="#E1E7D1"
              strokeLinecap="round"
              strokeWidth="20"
            />
            {/* Active Value Track (strokeDashoffset pergerakan progres, animasi halus) */}
            <path
              d="M 25 100 A 75 75 0 0 1 175 100"
              fill="none"
              stroke="#687A3E"
              strokeLinecap="round"
              strokeWidth="20"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          {/* Gauge Percentage Text */}
          <div className="absolute bottom-1 flex items-baseline justify-center">
            <span className="text-5xl font-extrabold text-[#536331] tracking-tight">
              {Math.round(progress)}
            </span>
            <span className="text-2xl font-bold text-[#536331] ml-0.5">%</span>
          </div>
        </div>
        <div className="h-4"></div>
      </div>
    </section>
  );
}
