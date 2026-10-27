"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PidControl } from "./pid-control";
import { useTelemetry } from "@/lib/hooks/use-telemetry";
import { useSessionControl } from "@/lib/hooks/use-session-control";
import { useNotifications } from "@/lib/hooks/use-notifications";

export function ControlsSection() {
  const { telemetry, isOffline } = useTelemetry();
  const { control, updateControl, isSaving } = useSessionControl();
  const { clearLowWater } = useNotifications();

  // Nilai awal diambil dari session_control. Komponen di-remount oleh
  // ControlsMount saat versi kontrol berubah, jadi tidak perlu effect sync.
  const [targetTemp, setTargetTemp] = useState(() =>
    control?.target_temp !== null && control?.target_temp !== undefined
      ? Number(control.target_temp)
      : 70.0
  );
  const [material, setMaterial] = useState(control?.material_type ?? "Kain");
  const [duration, setDuration] = useState(() =>
    control?.duration_minutes !== null && control?.duration_minutes !== undefined
      ? Number(control.duration_minutes)
      : 120
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const machineStatus = telemetry?.machine_status || "Mesin Siap";
  const burner1Active = Boolean(telemetry?.burner1_active);
  const burner2Active = Boolean(telemetry?.burner2_active);

  const isRunning = machineStatus === "Sedang Proses";
  const isPaused = machineStatus === "Jeda";
  const canStart = !isRunning && !isPaused;
  const canPauseResume = isRunning || isPaused;

  async function handleStart() {
    setActionError(null);
    try {
      await updateControl({
        status: "running",
        target_temp: targetTemp,
        duration_minutes: duration,
        material_type: material,
      });
      clearLowWater();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal mengirim perintah Mulai."
      );
    }
  }

  async function handlePauseResume() {
    setActionError(null);
    try {
      await updateControl({
        status: isRunning ? "paused" : "running",
        target_temp: targetTemp,
        duration_minutes: duration,
        material_type: material,
      });
      // Operator sudah mengakui peringatan air rendah saat melanjutkan.
      if (isPaused) clearLowWater();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal mengubah status proses."
      );
    }
  }

  async function handleStop() {
    setActionError(null);
    try {
      await updateControl({
        status: "stopped",
        target_temp: targetTemp,
        duration_minutes: duration,
        material_type: material,
      });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal menghentikan proses."
      );
    }
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* PID Control Column */}
      <PidControl />

      {/* Process Control Column */}
      <div className="custom-card lg:col-span-4 p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Kontrol Proses</h2>

          {/* Field: Jenis Bahan */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Jenis Bahan
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="custom-select custom-pill-input w-full h-10 px-4 text-xs font-medium text-gray-700 cursor-pointer"
            >
              <option>Kain</option>
              <option>Kulit</option>
            </select>
          </div>

          {/* Suhu Target Stepper */}
          <div className="flex items-center justify-between mb-4 px-2">
            <button
              type="button"
              aria-label="Kurangi Suhu"
              onClick={() => setTargetTemp((prev) => Math.max(50, +(prev - 0.5).toFixed(1)))}
              className="w-12 h-7 rounded-full border border-[#738450] text-[#5E7036] flex items-center justify-center font-bold hover:bg-[#6E8143] hover:text-white transition text-sm cursor-pointer select-none"
            >
              −
            </button>
            <div className="text-center">
              <span className="block text-[11px] text-gray-500 font-medium">Suhu Target</span>
              <span className="text-base font-bold text-gray-800">
                {targetTemp.toFixed(1)} <span className="text-xs font-normal">°C</span>
              </span>
            </div>
            <button
              type="button"
              aria-label="Tambah Suhu"
              onClick={() => setTargetTemp((prev) => Math.min(100, +(prev + 0.5).toFixed(1)))}
              className="w-12 h-7 rounded-full border border-[#738450] text-[#5E7036] flex items-center justify-center font-bold hover:bg-[#6E8143] hover:text-white transition text-sm cursor-pointer select-none"
            >
              +
            </button>
          </div>

          {/* Field: Durasi */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Durasi</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="custom-select custom-pill-input w-full h-9 px-3 text-xs font-medium text-gray-700 cursor-pointer"
            >
              <option value={60}>60 menit</option>
              <option value={90}>90 menit</option>
              <option value={120}>120 menit</option>
            </select>
          </div>

          {actionError && (
            <p className="text-[11px] font-medium text-[#D96B60] mb-2">{actionError}</p>
          )}

          {isOffline && (
            <p className="text-[11px] font-medium text-[#9C4A3F] mb-2">
              ESP32 terputus — perintah tetap dikirim, tetapi alat belum menerima.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart || isSaving}
              className={cn(
                "font-medium text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5 transition shadow-sm",
                canStart && !isSaving
                  ? "bg-[#687A3E] hover:bg-[#586834] text-white cursor-pointer"
                  : "bg-[#C9CEBE] text-white/80 cursor-not-allowed"
              )}
            >
              <span>▶</span> Mulai
            </button>
            <button
              type="button"
              onClick={handlePauseResume}
              disabled={!canPauseResume || isSaving}
              className={cn(
                "font-medium text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5 transition",
                canPauseResume && !isSaving
                  ? "bg-[#E0E7CF] hover:bg-[#D4DDBE] text-[#556434] cursor-pointer"
                  : "bg-[#EFEFEA] text-gray-400 cursor-not-allowed"
              )}
            >
              {isPaused ? (
                <>
                  <span>▶</span> Lanjutkan
                </>
              ) : (
                <>
                  <span>❚❚</span> Jeda
                </>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={handleStop}
            disabled={isSaving}
            className={cn(
              "w-full font-medium text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5 transition shadow-sm",
              isSaving
                ? "bg-[#E6B0A8] text-white/80 cursor-not-allowed"
                : "bg-[#D96B60] hover:bg-[#C95B50] text-white cursor-pointer"
            )}
          >
            <span className="text-[10px]">■</span> Stop / Reset
          </button>
        </div>
      </div>

      {/* Right Column: Status Cards */}
      <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
        {/* Status Mesin Card */}
        <div className="custom-card p-6 shadow-sm flex flex-col justify-center h-[130px]">
          <h3 className="text-xs font-semibold text-gray-600 mb-1">Status Mesin</h3>
          <p className="text-2xl lg:text-3xl font-extrabold text-[#5B6C36] tracking-tight">
            {machineStatus}
          </p>
        </div>

        {/* Status Burner Card */}
        <div className="custom-card p-6 shadow-sm flex flex-col justify-between flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-700">Status Burner</h3>
            <span className="bg-[#6B7D41] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              {burner1Active || burner2Active ? "Api terdeteksi" : "Mati"}
            </span>
          </div>

          {/* Burner 1 Row */}
          <div className="pb-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-800">Burner 1</h4>
              <p className="text-[11px] text-gray-500 font-normal">Sensor api</p>
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
                burner1Active
                  ? "bg-[#6B7D41] text-white"
                  : "bg-[#D9DBD0] text-gray-600"
              )}
            >
              {burner1Active ? "Aktif" : "Mati"}
            </span>
          </div>

          {/* Burner 2 Row */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-sm font-bold text-gray-800">Burner 2</h4>
              <p className="text-[11px] text-gray-500 font-normal">Sensor api</p>
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
                burner2Active
                  ? "bg-[#6B7D41] text-white"
                  : "bg-[#D9DBD0] text-gray-600"
              )}
            >
              {burner2Active ? "Aktif" : "Mati"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
