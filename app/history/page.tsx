"use client";

import { useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { SessionTable } from "@/components/history/session-table";
import { SessionDetail } from "@/components/history/session-detail";
import { SessionsProvider, useSessions } from "@/lib/hooks/use-sessions";

function HistoryPageContent() {
  const { sessions, isLoading } = useSessions();
  const [selectedId, setSelectedId] = useState<string>("");

  // Set selectedId ke session pertama saat data loaded
  const effectiveSelectedId = selectedId || (sessions.length > 0 ? sessions[0].id : "");
  const selectedSession = sessions.find((s) => s.id === effectiveSelectedId) || sessions[0];

  return (
    <main
      className="min-h-screen p-6 lg:p-10 pb-16 flex flex-col items-center"
      style={{ backgroundColor: "#F8F9F5" }}
    >
      <div className="w-full max-w-[1240px] space-y-6">
        <Navbar />
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Memuat data sesi...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Belum ada data sesi.</p>
          </div>
        ) : (
          <>
            <SessionTable
              sessions={sessions}
              selectedId={effectiveSelectedId}
              onSelectSession={setSelectedId}
            />
            {selectedSession && <SessionDetail session={selectedSession} />}
          </>
        )}
      </div>
    </main>
  );
}

export default function HistoryPage() {
  return (
    <SessionsProvider>
      <HistoryPageContent />
    </SessionsProvider>
  );
}
