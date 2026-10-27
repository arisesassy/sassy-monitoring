"use client";

import { useState } from "react";
import { usePidParameters } from "@/lib/hooks/use-pid-parameters";
import { useTelemetry } from "@/lib/hooks/use-telemetry";

function safeNum(val: unknown, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

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
  const [isTraining, setIsTraining] = useState(false);
  const { telemetry, isDeviceOnline, isStandby, displayMachineStatus } =
    useTelemetry();
  const { activeParams, pendingParams, hasPending, approvePending, rejectPending } = usePidParameters();

  // Saat standby/jeda/offline tidak ada pembakaran aktif, jadi jangan
  // tampilkan bukaan gas dari row telemetri sesi lama.
  const gasClosed =
    !isDeviceOnline || isStandby || displayMachineStatus === "Jeda";
  const pidOutput = gasClosed
    ? 0
    : Math.min(100, Math.max(0, safeNum(telemetry?.pid_output_percent, 0)));

  async function handleUpdatePID() {
    setIsTraining(true);
    // TODO: Panggil FastAPI endpoint untuk training PID
    // const response = await fetch(process.env.NEXT_PUBLIC_FASTAPI_URL + '/train-pid', { method: 'POST' });
    // Simulasi delay 2 detik
    setTimeout(() => {
      setIsTraining(false);
    }, 2000);
  }

  async function handleApprove() {
    await approvePending();
  }

  async function handleReject() {
    await rejectPending();
  }

  return (
    <div className="custom-card lg:col-span-4 p-5 shadow-sm flex flex-col justify-between min-h-[330px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-800">Kontrol PID</h2>
        <span
          title="Bukaan katup gas proporsional yang diperintahkan PID. 0% = tertutup rapat, 100% = terbuka penuh."
          aria-label={`Bukaan gas ${Math.round(pidOutput)} persen. 0 persen berarti katup tertutup rapat, 100 persen berarti terbuka penuh.`}
          className="bg-[#61713B] text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full cursor-help inline-flex items-center gap-1"
        >
          Bukaan Gas {Math.round(pidOutput)}%
          <span aria-hidden="true" className="text-[9px] opacity-80">
            ⓘ
          </span>
        </span>
      </div>

      {/* Body */}
      <div className="flex-1">
        {!hasPending ? (
          /* --- Current active params --- */
          <>
            <p className="text-[11px] font-semibold text-[#6E8143] uppercase tracking-wide mb-3">
              Parameter Aktif
            </p>
            <PidParamRow label="Kain" values={activeParams.kain} />
            <PidParamRow label="Kulit" values={activeParams.kulit} />
          </>
        ) : (
          /* --- Comparison: old vs pending_review --- */
          <>
            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide mb-3">
              Menunggu Persetujuan
            </p>
            {pendingParams.kain && <CompareRow label="Kain" oldVal={activeParams.kain} newVal={pendingParams.kain} />}
            {pendingParams.kulit && <CompareRow label="Kulit" oldVal={activeParams.kulit} newVal={pendingParams.kulit} />}
            <p className="text-[10px] text-gray-400 mt-1">
              Dicoret = nilai lama · Tebal = nilai baru · Hijau = berubah
            </p>
          </>
        )}
      </div>

      {/* Footer buttons */}
      {!hasPending ? (
        <button
          type="button"
          onClick={handleUpdatePID}
          disabled={isTraining}
          className="mt-3 w-full bg-[#6E8143] hover:bg-[#5E7036] disabled:opacity-60 text-white font-medium text-xs py-2.5 rounded-full transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
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
        <div className="grid grid-cols-2 gap-3 mt-3">
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
