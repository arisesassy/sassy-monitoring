"use client";

import { useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { SessionTable, type SessionItem } from "@/components/history/session-table";
import { SessionDetail } from "@/components/history/session-detail";

// Dummy data sesuai references/history.html
const DUMMY_SESSIONS: SessionItem[] = [
  {
    id: "1",
    code: "S-02N",
    timestamp: "23/10/2026, 13.48.19",
    material: "Kain",
    targetTemp: 90,
    durationMinutes: 120,
    status: "Selesai",
  },
  {
    id: "2",
    code: "S-03N",
    timestamp: "23/10/2026, 13.48.19",
    material: "Kulit",
    targetTemp: 70,
    durationMinutes: 90,
    status: "Dihentikan",
  },
  {
    id: "3",
    code: "S-04N",
    timestamp: "23/10/2026, 13.48.19",
    material: "Kain",
    targetTemp: 90,
    durationMinutes: 180,
    status: "Dihentikan",
  },
  {
    id: "4",
    code: "S-05N",
    timestamp: "23/10/2026, 13.48.19",
    material: "Kain",
    targetTemp: 65,
    durationMinutes: 120,
    status: "Dihentikan",
  },
  {
    id: "5",
    code: "S-06N",
    timestamp: "23/10/2026, 13.48.19",
    material: "Kain",
    targetTemp: 90,
    durationMinutes: 60,
    status: "Dihentikan",
  },
];

export default function HistoryPage() {
  const [selectedId, setSelectedId] = useState<string>("1");

  const selectedSession =
    DUMMY_SESSIONS.find((s) => s.id === selectedId) || DUMMY_SESSIONS[0];

  return (
    <main
      className="min-h-screen p-6 lg:p-10 flex flex-col items-center"
      style={{ backgroundColor: "#F8F9F5" }}
    >
      <div className="w-full max-w-[1240px] space-y-6">
        <Navbar />
        <SessionTable
          sessions={DUMMY_SESSIONS}
          selectedId={selectedId}
          onSelectSession={setSelectedId}
        />
        <SessionDetail session={selectedSession} />
      </div>
    </main>
  );
}
