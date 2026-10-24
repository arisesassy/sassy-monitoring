"use client";

import { useState } from "react";

// Dummy active PID params from Supabase (status: "active")
const ACTIVE_PID = {
  kain: { kp: 8.0, ki: 0.08, kd: 10.0 },
  kulit: { kp: 6.5, ki: 0.05, kd: 8.0 },
};

// Dummy pending_review PID from FastAPI (status: "pending_review")
const PENDING_PID = {
  kain: { kp: 9.2, ki: 0.11, kd: 11.5 },
  kulit: { kp: 7.1, ki: 0.07, kd: 9.3 },
};

type PidRow = { kp: number; ki: number; kd: number };

function PidParamRow({ label, values }: { label: string; values: PidRow }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold text-gray-500 mb-1">{label}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { k: "Kp", v: values.kp },
          { k: "Ki", v: values.ki },
          { k: "Kd", v: values.kd },
        ].map(({ k, v }) => (
          <div key={k} className="bg-[#F0F2EA] rounded-xl py-1.5">
            <p className="text-[10px] text-gray-500 font-medium">{k}</p>
            <p className="text-sm font-bold text-[#4E5E30]">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompareRow({
  label,
  oldVal,
  newVal,
}: {
  label: string;
  oldVal: PidRow;
  newVal: PidRow;
}) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold text-gray-500 mb-1">{label}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {(["kp", "ki", "kd"] as const).map((key) => {
          const changed = oldVal[key] !== newVal[key];
          return (
            <div key={key} className={`rounded-xl py-1.5 ${changed ? "bg-[#E8F0D8] ring-1 ring-[#6E8143]/30" : "bg-[#F0F2EA]"}`}>
              <p className="text-[10px] text-gray-500 font-medium uppercase">{key}</p>
              <p className="text-[10px] text-gray-400 line-through leading-none">{oldVal[key]}</p>
              <p className={`text-sm font-bold leading-tight ${changed ? "text-[#4E5E30]" : "text-gray-500"}`}>
                {newVal[key]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PidControl() {
  const [isPending, setIsPending] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  function handleUpdatePID() {
    setIsTraining(true);
    // Simulate FastAPI call delay — replace with actual fetch()
    setTimeout(() => {
      setIsTraining(false);
      setIsPending(true);
    }, 1800);
  }

  function handleApprove() {
    // TODO: PATCH pid_parameters status → "active" via Supabase
    setIsPending(false);
  }

  function handleReject() {
    setIsPending(false);
  }

  return (
    <div className="custom-card lg:col-span-4 p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-800">Kontrol PID</h2>
        <span className="bg-[#61713B] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
          Output 36%
        </span>
      </div>

      {/* Body */}
      <div className="flex-1">
        {!isPending ? (
          /* --- Current active params --- */
          <>
            <p className="text-[11px] font-semibold text-[#6E8143] uppercase tracking-wide mb-3">
              Parameter Aktif
            </p>
            <PidParamRow label="Kain" values={ACTIVE_PID.kain} />
            <PidParamRow label="Kulit" values={ACTIVE_PID.kulit} />
          </>
        ) : (
          /* --- Comparison: old vs pending_review --- */
          <>
            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide mb-3">
              Menunggu Persetujuan
            </p>
            <CompareRow label="Kain" oldVal={ACTIVE_PID.kain} newVal={PENDING_PID.kain} />
            <CompareRow label="Kulit" oldVal={ACTIVE_PID.kulit} newVal={PENDING_PID.kulit} />
            <p className="text-[10px] text-gray-400 mt-1">
              Dicoret = nilai lama · Tebal = nilai baru · Hijau = berubah
            </p>
          </>
        )}
      </div>

      {/* Footer buttons */}
      {!isPending ? (
        <button
          type="button"
          onClick={handleUpdatePID}
          disabled={isTraining}
          className="mt-5 w-full bg-[#6E8143] hover:bg-[#5E7036] disabled:opacity-60 text-white font-medium text-xs py-2.5 rounded-full transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          {isTraining ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Melatih model…
            </>
          ) : (
            "✦ Update PID"
          )}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            type="button"
            onClick={handleApprove}
            className="bg-[#6E8143] hover:bg-[#5E7036] text-white font-medium text-xs py-2.5 rounded-full transition shadow-sm cursor-pointer"
          >
            ✓ Setujui
          </button>
          <button
            type="button"
            onClick={handleReject}
            className="bg-[#E0E7CF] hover:bg-[#D4DDBE] text-[#556434] font-medium text-xs py-2.5 rounded-full transition cursor-pointer"
          >
            Tolak
          </button>
        </div>
      )}
    </div>
  );
}
