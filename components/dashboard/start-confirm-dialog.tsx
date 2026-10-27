"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { WATER_MIN } from "@/lib/process-config";

interface StartConfirmDialogProps {
  open: boolean;
  material: string;
  targetTemp: number;
  duration: number;
  durationValid: boolean;
  waterLabel: string;
  waterOk: boolean;
  online: boolean;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function StartConfirmDialog({
  open,
  material,
  targetTemp,
  duration,
  durationValid,
  waterLabel,
  waterOk,
  online,
  isSaving,
  error,
  onClose,
  onConfirm,
}: StartConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const isSavingRef = useRef(isSaving);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    isSavingRef.current = isSaving;
  }, [isSaving]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSavingRef.current) {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open) return null;

  const canConfirm = waterOk && online && durationValid && !isSaving;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={() => {
          if (!isSaving) onClose();
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-confirm-title"
        aria-describedby="start-confirm-description"
        className="custom-card relative w-full max-w-md p-6 shadow-2xl"
      >
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6E8143]">
            Konfirmasi
          </p>
          <h2
            id="start-confirm-title"
            className="mt-1 text-lg font-bold text-gray-800"
          >
            Mulai Pengukusan
          </h2>
          <p
            id="start-confirm-description"
            className="mt-1 text-xs text-gray-500"
          >
            Periksa parameter dan level air sebelum mengirim perintah ke ESP32.
          </p>
        </div>

        <dl className="space-y-2.5 rounded-2xl bg-[#F0F2EA] p-4 text-xs">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-500">Bahan</dt>
            <dd className="font-semibold text-gray-800">{material}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-500">Target Suhu</dt>
            <dd className="font-semibold text-gray-800">{targetTemp}°C</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-500">Durasi</dt>
            <dd
              className={cn(
                "font-semibold",
                durationValid ? "text-gray-800" : "text-[#D96B60]"
              )}
            >
              {durationValid ? `${duration} menit` : "Belum valid"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-500">Level Air</dt>
            <dd
              className={cn(
                "font-semibold",
                waterOk ? "text-[#5B6C36]" : "text-[#D96B60]"
              )}
            >
              {waterLabel}
            </dd>
          </div>
        </dl>

        <div className="mt-3 space-y-2">
          {!waterOk && (
            <p className="rounded-xl border border-[#E9C3BC] bg-[#FDF1EE] px-3 py-2 text-[11px] font-semibold text-[#9C4A3F]">
              Level air minimal {WATER_MIN}% diperlukan sebelum memulai.
            </p>
          )}
          {!online && (
            <p className="rounded-xl border border-[#E9C3BC] bg-[#FDF1EE] px-3 py-2 text-[11px] font-semibold text-[#9C4A3F]">
              ESP32 offline. Tunggu koneksi pulih sebelum memulai.
            </p>
          )}
          {error && (
            <p
              aria-live="polite"
              className="rounded-xl border border-[#E9C3BC] bg-[#FDF1EE] px-3 py-2 text-[11px] font-semibold text-[#9C4A3F]"
            >
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => {
              if (!isSaving) onClose();
            }}
            disabled={isSaving}
            className="rounded-full border border-[#D7DCCB] bg-[#FAFAF7] py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-[#F0F2EA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className={cn(
              "flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold text-white shadow-sm transition",
              canConfirm
                ? "cursor-pointer bg-[#687A3E] hover:bg-[#586834]"
                : "cursor-not-allowed bg-[#C9CEBE] text-white/80"
            )}
          >
            {isSaving && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            Lanjut Mulai
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
