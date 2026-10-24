"use client";

import { cn } from "@/lib/utils";

export interface SessionItem {
  id: string;
  code: string;
  timestamp: string;
  material: "Kain" | "Kulit";
  targetTemp: number;
  durationMinutes: number;
  status: "Selesai" | "Dihentikan";
}

interface SessionTableProps {
  sessions: SessionItem[];
  selectedId: string;
  onSelectSession: (id: string) => void;
}

export function SessionTable({
  sessions,
  selectedId,
  onSelectSession,
}: SessionTableProps) {
  return (
    <section className="bg-[#F3F4EE] rounded-[28px] p-8 md:p-10 shadow-xs">
      <h2 className="text-2xl font-bold tracking-tight text-[#485338] mb-6">
        Daftar Sesi Pengukusan
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs md:text-sm font-semibold text-[#6E7B5C] border-b border-[#E3E6DC]">
              <th className="pb-3.5 pl-2 font-medium" scope="col">
                Sesi
              </th>
              <th className="pb-3.5 px-4 font-medium" scope="col">
                Waktu
              </th>
              <th className="pb-3.5 px-4 font-medium" scope="col">
                Bahan
              </th>
              <th className="pb-3.5 px-4 font-medium" scope="col">
                Target
              </th>
              <th className="pb-3.5 px-4 font-medium" scope="col">
                Durasi
              </th>
              <th className="pb-3.5 pr-2 text-right font-medium" scope="col">
                Status Proses
              </th>
            </tr>
          </thead>
          <tbody className="text-sm font-semibold text-[#3D4730]">
            {sessions.map((s) => {
              const isSelected = s.id === selectedId;
              return (
                <tr
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={cn(
                    "border-b border-[#ECEEE7] last:border-b-0 hover:bg-[#ECEEE6]/60 transition-colors cursor-pointer",
                    isSelected && "bg-[#ECEEE6]/80"
                  )}
                >
                  <td className="py-4 pl-2 font-bold text-[#323B25]">{s.code}</td>
                  <td className="py-4 px-4 text-[#4F593F] font-normal">{s.timestamp}</td>
                  <td className="py-4 px-4 text-[#4F593F]">{s.material}</td>
                  <td className="py-4 px-4 text-[#3E4731]">{s.targetTemp}°C</td>
                  <td className="py-4 px-4 text-[#3E4731]">{s.durationMinutes} menit</td>
                  <td className="py-4 pr-2 text-right">
                    {s.status === "Selesai" ? (
                      <span className="inline-block px-5 py-1 text-xs rounded-full bg-[#728248] text-white font-medium shadow-2xs">
                        Selesai
                      </span>
                    ) : (
                      <span className="inline-block px-4 py-1 text-xs rounded-full bg-[#D7DBD1] text-[#717A66] font-medium">
                        Dihentikan
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
