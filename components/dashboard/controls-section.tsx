"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PidControl } from "./pid-control";
import { StartConfirmDialog } from "./start-confirm-dialog";
import { useTelemetry } from "@/lib/hooks/use-telemetry";
import { useSessionControl } from "@/lib/hooks/use-session-control";
import { useNotifications } from "@/lib/hooks/use-notifications";
import {
  DURATION_MAX,
  DURATION_MIN,
  DURATION_STEP,
  MATERIAL_OPTIONS,
  WATER_MIN,
  formatWaterLevel,
  getProcessPhase,
  getTargetTemp,
  isValidDuration,
  normalizeMaterial,
  type MaterialType,
} from "@/lib/process-config";

export function ControlsSection() {
  const {
    telemetry,
    isDeviceOnline,
    hasDevicePresence,
    displayMachineStatus,
    displayWaterLevel,
    isStandby,
  } = useTelemetry();
  const { control, updateControl, isSaving } = useSessionControl();
  const { clearLowWater } = useNotifications();

  // Nilai awal diambil dari session_control. ControlsMount me-remount hanya
  // saat field form berubah, jadi heartbeat standby tidak mereset input.
  const [material, setMaterial] = useState<MaterialType>(() =>
    normalizeMaterial(control?.material_type)
  );
  const [durationInput, setDurationInput] = useState(() => {
    if (
      control?.duration_minutes !== null &&
      control?.duration_minutes !== undefined &&
      Number.isFinite(Number(control.duration_minutes))
    ) {
      return String(Number(control.duration_minutes));
    }
    return String(DURATION_MIN);
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const machineStatus = displayMachineStatus;
  const controlStatus = control?.status;

  const isRunning = isDeviceOnline && machineStatus === "Sedang Proses";
  const isPaused = isDeviceOnline && machineStatus === "Jeda";
  const pausedSession = isPaused || controlStatus === "paused";
  const sessionActive =
    controlStatus === "running" ||
    controlStatus === "paused" ||
    isRunning ||
    isPaused;
  const inputsLocked = sessionActive;

  // Saat standby atau jeda, gas pasti tertutup. Jangan tampilkan status
  // burner aktif dari row telemetri sesi lama.
  const burnersTrusted = isDeviceOnline && !isStandby && !isPaused;
  const burner1Active =
    burnersTrusted && Boolean(telemetry?.burner1_active);
  const burner2Active =
    burnersTrusted && Boolean(telemetry?.burner2_active);
  const bothBurnersActive = burner1Active && burner2Active;
  const anyBurnerActive = burner1Active || burner2Active;

  const duration = Number(durationInput);
  const durationValid = isValidDuration(duration);
  const targetTemp = getTargetTemp(material);
  const phase = isRunning ? getProcessPhase(telemetry) : null;

  const rawWaterLevel = displayWaterLevel;
  const waterOk = rawWaterLevel !== null && rawWaterLevel >= WATER_MIN;
  const online = isDeviceOnline;

  const canStart =
    !sessionActive && waterOk && online && durationValid && !isSaving;
  const canPause = isRunning && !isSaving;
  const canResume = isPaused && waterOk && online && !isSaving;
  const canPauseResume = isRunning ? canPause : canResume;
  const canStop = !isSaving;

  const blockers: string[] = [];
  if (!isDeviceOnline) {
    blockers.push(
      hasDevicePresence
        ? "ESP32 offline — heartbeat terakhir lebih dari 25 detik lalu."
        : "Menunggu heartbeat ESP32. Pastikan alat menyala dan terhubung."
    );
  } else if (rawWaterLevel === null) {
    blockers.push("Menunggu data level air dari ESP32.");
  } else if (!waterOk) {
    blockers.push(
      `Level air ${formatWaterLevel(rawWaterLevel)} — minimal ${WATER_MIN}% untuk memulai/melanjutkan.`
    );
  }
  if (!durationValid && !pausedSession) {
    blockers.push(
      `Durasi harus berupa angka ${DURATION_MIN}–${DURATION_MAX} menit.`
    );
  }

  const safeDuration = durationValid ? duration : DURATION_MIN;

  async function handleStartConfirm() {
    if (!canStart) {
      setActionError("Kondisi belum aman untuk memulai. Periksa air dan koneksi.");
      return;
    }

    setActionError(null);

    try {
      await updateControl({
        status: "running",
        target_temp: targetTemp,
        duration_minutes: duration,
        material_type: material,
      });
      clearLowWater();
      setShowConfirm(false);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal mengirim perintah Mulai."
      );
    }
  }

  async function handlePauseResume() {
    if (!canPauseResume) return;

    setActionError(null);

    try {
      await updateControl({
        status: isRunning ? "paused" : "running",
        target_temp: targetTemp,
        duration_minutes: safeDuration,
        material_type: material,
      });

      if (isPaused) {
        clearLowWater();
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal mengubah status proses."
      );
    }
  }

  async function handleStop() {
    setActionError(null);
    setShowConfirm(false);

    try {
      await updateControl({
        status: "stopped",
        target_temp: targetTemp,
        duration_minutes: safeDuration,
        material_type: material,
      });
      clearLowWater();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal menghentikan proses."
      );
    }
  }

  function handleStartClick() {
    if (!canStart) return;
    setActionError(null);
    setShowConfirm(true);
  }

  function adjustDuration(delta: number) {
    if (inputsLocked || isSaving) return;

    const current = Number.isFinite(duration) ? duration : DURATION_MIN;
    const rounded = Math.round(current / DURATION_STEP) * DURATION_STEP;
    const next = Math.min(
      DURATION_MAX,
      Math.max(DURATION_MIN, rounded + delta)
    );

    setDurationInput(String(next));
    setActionError(null);
  }

  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* PID Control Column */}
        <PidControl />

        {/* Process Control Column */}
        <div className="custom-card lg:col-span-4 p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              Kontrol Proses
            </h2>

            {/* Field: Jenis Bahan */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Jenis Bahan
              </label>
              <select
                value={material}
                onChange={(event) =>
                  setMaterial(normalizeMaterial(event.target.value))
                }
                disabled={inputsLocked || isSaving}
                className="custom-select custom-pill-input w-full h-10 px-4 text-xs font-medium text-gray-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {MATERIAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Suhu target otomatis mengikuti bahan */}
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#F0F2EA] px-4 py-3">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  Suhu Target
                </span>
                <span className="text-base font-bold text-gray-800">
                  {targetTemp}{" "}
                  <span className="text-xs font-normal">°C</span>
                </span>
              </div>
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-[#6E8143]">
                Otomatis · {material}
              </span>
            </div>

            {/* Field: Durasi */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Durasi
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Kurangi durasi 5 menit"
                  onClick={() => adjustDuration(-DURATION_STEP)}
                  disabled={inputsLocked || isSaving}
                  className="w-9 h-9 shrink-0 rounded-full border border-[#738450] text-[#5E7036] flex items-center justify-center font-bold transition hover:bg-[#6E8143] hover:text-white text-sm cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={DURATION_MIN}
                  max={DURATION_MAX}
                  step={DURATION_STEP}
                  value={durationInput}
                  onChange={(event) => {
                    setDurationInput(event.target.value);
                    setActionError(null);
                  }}
                  disabled={inputsLocked || isSaving}
                  aria-invalid={!durationValid}
                  aria-label="Durasi dalam menit"
                  className={cn(
                    "custom-pill-input h-9 min-w-0 flex-1 px-3 text-center text-xs font-semibold text-gray-700 outline-none disabled:cursor-not-allowed disabled:opacity-60",
                    !durationValid && "border-[#D96B60]"
                  )}
                />
                <button
                  type="button"
                  aria-label="Tambah durasi 5 menit"
                  onClick={() => adjustDuration(DURATION_STEP)}
                  disabled={inputsLocked || isSaving}
                  className="w-9 h-9 shrink-0 rounded-full border border-[#738450] text-[#5E7036] flex items-center justify-center font-bold transition hover:bg-[#6E8143] hover:text-white text-sm cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-gray-400">
                Angka 60–120 menit. Tombol ± melangkah 5 menit.
              </p>
            </div>

            {actionError && (
              <p className="text-[11px] font-medium text-[#D96B60] mb-2">
                {actionError}
              </p>
            )}

            {!isRunning && blockers.length > 0 && (
              <div className="mb-2 rounded-2xl border border-[#E9C3BC] bg-[#FDF1EE] px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#9C4A3F]">
                  {pausedSession
                    ? "Belum bisa dilanjutkan"
                    : "Belum bisa dimulai"}
                </p>
                <ul className="mt-1 space-y-1">
                  {blockers.map((blocker) => (
                    <li
                      key={blocker}
                      className="text-[11px] font-medium leading-snug text-[#9C4A3F]"
                    >
                      {blocker}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sessionActive && !isDeviceOnline && (
              <p className="text-[11px] font-medium text-[#9C4A3F] mb-2">
                ESP32 terputus — status sesi terakhir tersimpan. Stop/Reset
                tetap dikirim dan akan dibaca alat setelah tersambung kembali.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleStartClick}
                disabled={!canStart}
                className={cn(
                  "font-medium text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5 transition shadow-sm",
                  canStart
                    ? "bg-[#687A3E] hover:bg-[#586834] text-white cursor-pointer"
                    : "bg-[#C9CEBE] text-white/80 cursor-not-allowed"
                )}
              >
                <span>▶</span> Mulai
              </button>
              <button
                type="button"
                onClick={handlePauseResume}
                disabled={!canPauseResume}
                className={cn(
                  "font-medium text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5 transition",
                  canPauseResume
                    ? "bg-[#E0E7CF] hover:bg-[#D4DDBE] text-[#556434] cursor-pointer"
                    : "bg-[#EFEFEA] text-gray-400 cursor-not-allowed"
                )}
              >
                {pausedSession ? (
                  <>
                    <span>▶</span> Lanjut
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
              disabled={!canStop}
              className={cn(
                "w-full font-medium text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5 transition shadow-sm",
                canStop
                  ? "bg-[#D96B60] hover:bg-[#C95B50] text-white cursor-pointer"
                  : "bg-[#E6B0A8] text-white/80 cursor-not-allowed"
              )}
            >
              <span className="text-[10px]">■</span> Stop / Reset
            </button>
          </div>
        </div>

        {/* Right Column: Status Cards */}
        <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
          {/* Status Mesin Card */}
          <div className="custom-card p-6 shadow-sm flex flex-col justify-center min-h-[130px]">
            <h3 className="text-xs font-semibold text-gray-600 mb-1">
              Status Mesin
            </h3>
            <p className="text-2xl lg:text-3xl font-extrabold text-[#5B6C36] tracking-tight">
              {machineStatus}
            </p>
            {phase && (
              <div className="mt-1.5 flex items-start gap-1.5">
                <span
                  className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    phase.key === "ignition"
                      ? "bg-[#D99A4E]"
                      : phase.key === "heating"
                        ? "bg-[#6E8143]"
                        : "bg-[#4E8B57]"
                  )}
                />
                <p
                  className={cn(
                    "text-[10px] font-semibold leading-snug sm:text-[11px]",
                    phase.key === "ignition"
                      ? "text-[#9C6A2F]"
                      : "text-[#5B6C36]"
                  )}
                >
                  {phase.label}
                </p>
              </div>
            )}
          </div>

          {/* Status Burner Card */}
          <div className="custom-card p-6 shadow-sm flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-700">Status Burner</h3>
              <span
                className={cn(
                  "text-white text-[10px] font-medium px-2 py-0.5 rounded-full",
                  bothBurnersActive
                    ? "bg-[#6B7D41]"
                    : anyBurnerActive
                      ? "bg-[#C58B3D]"
                      : "bg-[#9DA291]"
                )}
              >
                {bothBurnersActive
                  ? "Kedua api aktif"
                  : anyBurnerActive
                    ? "Api tidak lengkap"
                    : "Mati"}
              </span>
            </div>

            {/* Burner 1 Row */}
            <div className="pb-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-800">Burner 1</h4>
                <p className="text-[11px] text-gray-500 font-normal">
                  Sensor api
                </p>
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
                <p className="text-[11px] text-gray-500 font-normal">
                  Sensor api
                </p>
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

      <StartConfirmDialog
        open={showConfirm}
        material={material}
        targetTemp={targetTemp}
        duration={duration}
        durationValid={durationValid}
        waterLabel={formatWaterLevel(rawWaterLevel)}
        waterOk={waterOk}
        online={online}
        isSaving={isSaving}
        error={actionError}
        onClose={() => {
          if (!isSaving) {
            setShowConfirm(false);
            setActionError(null);
          }
        }}
        onConfirm={handleStartConfirm}
      />
    </>
  );
}
