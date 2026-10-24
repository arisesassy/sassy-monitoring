"use client";

export function MetricsRow() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Metric 1: Suhu Aktual (Olive Green Card) */}
      <div className="bg-[#617438] text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between h-[164px]">
        <h3 className="text-white/90 text-sm font-medium">Suhu Aktual</h3>
        <div className="flex items-baseline">
          <span className="text-5xl font-bold tracking-tight">30.0</span>
          <span className="text-2xl font-light ml-1">°C</span>
        </div>
        <p className="text-xs text-white/80 font-normal tracking-wide">
          PT100-1 30.8°C · PT100-2 29.7°C
        </p>
      </div>

      {/* Metric 2: Suhu Target */}
      <div className="custom-card p-6 shadow-sm flex flex-col justify-between h-[164px]">
        <h3 className="text-gray-600 text-sm font-medium">Suhu Target</h3>
        <div className="flex items-baseline text-neutral-800">
          <span className="text-5xl font-bold tracking-tight">70</span>
          <span className="text-2xl font-light ml-1 text-gray-500">°C</span>
        </div>
        <p className="text-xs text-gray-500 font-normal">Selisih sensor 0.1°C · Normal</p>
      </div>

      {/* Metric 3: Level Air */}
      <div className="custom-card p-6 shadow-sm flex flex-col justify-between h-[164px]">
        <h3 className="text-gray-600 text-sm font-medium">Level Air</h3>
        <div className="flex items-baseline text-neutral-800">
          <span className="text-5xl font-bold tracking-tight">50</span>
          <span className="text-2xl font-normal ml-0.5 text-gray-500">%</span>
        </div>
        <p className="text-xs text-gray-500 font-normal">Selisih sensor 0.1°C · Normal</p>
      </div>

      {/* Metric 4: Sisa Waktu */}
      <div className="custom-card p-6 shadow-sm flex flex-col justify-between h-[164px]">
        <h3 className="text-gray-600 text-sm font-medium">Sisa Waktu</h3>
        <div className="flex items-baseline text-[#546430]">
          <span className="text-4xl lg:text-[2.6rem] font-bold tracking-tight">00:00:00</span>
        </div>
        <p className="text-xs text-gray-500 font-normal">Siap dimulai</p>
      </div>
    </section>
  );
}
