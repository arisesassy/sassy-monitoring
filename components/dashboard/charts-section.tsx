"use client";

import { useTelemetry } from "@/lib/hooks/use-telemetry";

export function ChartsSection() {
  const { telemetry, historyPoints } = useTelemetry();
  const progress = telemetry.process_progress;

  // Hitung stroke-dasharray & stroke-dashoffset untuk busur setengah lingkaran
  const radius = 75;
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - progress / 100);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Temperature vs Time Chart Card */}
      <div className="custom-card lg:col-span-7 p-7 shadow-sm flex flex-col justify-between min-h-[340px]">
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-6">Grafik suhu terhadap waktu</h2>
          {/* Mock Chart Graphic Component */}
          <div className="relative w-full h-[180px] flex flex-col justify-between py-2 text-xs text-gray-500 font-medium">
            {/* Grid Lines & Y-Axis Labels */}
            <div className="flex items-center gap-3 w-full">
              <span className="w-10 text-right">90°C</span>
              <div className="flex-1 border-b border-gray-200"></div>
            </div>
            <div className="flex items-center gap-3 w-full">
              <span className="w-10 text-right">60°C</span>
              <div className="flex-1 border-b border-gray-200"></div>
            </div>
            <div className="flex items-center gap-3 w-full">
              <span className="w-10 text-right">30°C</span>
              <div className="flex-1 border-b border-gray-200"></div>
            </div>

            {/* Mini visualization: latest 5 points */}
            <div className="mt-4 flex items-end justify-between h-12 gap-1 px-2">
              {historyPoints.slice(-5).map((point, idx) => {
                const tempNorm = (point.temp - 20) / 80; // Normalize 20-100°C range
                const height = Math.max(20, Math.min(100, tempNorm * 100));
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-[#65763D] rounded-t opacity-70 hover:opacity-100 transition"
                    style={{ height: `${height}%` }}
                    title={`${point.temp}°C`}
                  />
                );
              })}
            </div>
          </div>
        </div>
        {/* Legend Items */}
        <div className="flex items-center gap-6 mt-4 text-xs font-semibold text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#65763D]"></span>
            <span>Suhu Aktual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E1E8D2]"></span>
            <span>Suhu Target</span>
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
