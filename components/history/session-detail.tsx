"use client";

import { SessionItem } from "./session-table";

interface SessionDetailProps {
  session: SessionItem;
}

export function SessionDetail({ session }: SessionDetailProps) {
  function handleExportCSV() {
    // Generate dummy CSV
    const rows = [
      ["Sesi", "Waktu", "Bahan", "Target Suhu", "Durasi", "Status"],
      [
        session.code,
        session.timestamp,
        session.material,
        `${session.targetTemp}°C`,
        `${session.durationMinutes} menit`,
        session.status,
      ],
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sesi_${session.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <section className="bg-[#F3F4EE] rounded-[28px] p-8 md:p-10 shadow-xs space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-[#485338]">
          Detail {session.code}
        </h2>
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#7D8B63] text-xs font-semibold text-[#505D3A] bg-transparent hover:bg-[#EAECE4] transition duration-150 cursor-pointer"
        >
          <span>Ekspor CSV</span>
          <svg className="w-3 h-3 text-[#505D3A] fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>

      {/* Parameter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Bahan */}
        <div className="bg-[#728248] text-white p-5 rounded-2xl min-h-[110px] flex flex-col justify-between shadow-2xs">
          <span className="text-sm font-medium text-[#DDE4CF]">Bahan</span>
          <span className="text-3xl font-bold tracking-tight mt-2">{session.material}</span>
        </div>

        {/* Card 2: Suhu Target */}
        <div className="bg-[#728248] text-white p-5 rounded-2xl min-h-[110px] flex flex-col justify-between shadow-2xs">
          <span className="text-sm font-medium text-[#DDE4CF]">Suhu Target</span>
          <span className="text-3xl font-bold tracking-tight mt-2">
            {session.targetTemp}°C
          </span>
        </div>

        {/* Card 3: Durasi */}
        <div className="bg-[#728248] text-white p-5 rounded-2xl min-h-[110px] flex flex-col justify-between shadow-2xs">
          <span className="text-sm font-medium text-[#DDE4CF]">Durasi</span>
          <span className="text-3xl font-bold tracking-tight mt-2">
            {session.durationMinutes} menit
          </span>
        </div>

        {/* Card 4: Status Akhir */}
        <div className="bg-[#728248] text-white p-5 rounded-2xl min-h-[110px] flex flex-col justify-between shadow-2xs">
          <span className="text-sm font-medium text-[#DDE4CF]">Status Akhir</span>
          <span className="text-3xl font-bold tracking-tight mt-2">{session.status}</span>
        </div>
      </div>

      {/* Temperature Graph Section */}
      <div className="pt-6 pb-2">
        <div className="relative w-full space-y-16">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[#5A6745] w-10 text-left">90°C</span>
            <div className="flex-1 border-b border-[#E1E4DB]"></div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[#5A6745] w-10 text-left">60°C</span>
            <div className="flex-1 border-b border-[#E1E4DB]"></div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[#5A6745] w-10 text-left">30°C</span>
            <div className="flex-1 border-b border-[#E1E4DB]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
