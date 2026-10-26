"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface PidParameter {
  id: number;
  material_type: "Kain" | "Kulit";
  kp: number;
  ki: number;
  kd: number;
  status: "active" | "pending_review" | "archived";
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PidParams {
  kp: number;
  ki: number;
  kd: number;
}

export function usePidParameters() {
  const [activeParams, setActiveParams] = useState<{
    kain: PidParams;
    kulit: PidParams;
  }>({
    kain: { kp: 8.0, ki: 0.08, kd: 10.0 },
    kulit: { kp: 6.5, ki: 0.05, kd: 8.0 },
  });

  const [pendingParams, setPendingParams] = useState<{
    kain: PidParams | null;
    kulit: PidParams | null;
  }>({
    kain: null,
    kulit: null,
  });

  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    async function fetchParams() {
      // Fetch active params
      const { data: activeData } = await supabase
        .from("pid_parameters")
        .select("*")
        .eq("status", "active");

      if (activeData) {
        const kainActive = activeData.find((p) => p.material_type === "Kain");
        const kulitActive = activeData.find((p) => p.material_type === "Kulit");

        setActiveParams({
          kain: kainActive
            ? { kp: Number(kainActive.kp), ki: Number(kainActive.ki), kd: Number(kainActive.kd) }
            : { kp: 8.0, ki: 0.08, kd: 10.0 },
          kulit: kulitActive
            ? { kp: Number(kulitActive.kp), ki: Number(kulitActive.ki), kd: Number(kulitActive.kd) }
            : { kp: 6.5, ki: 0.05, kd: 8.0 },
        });
      }

      // Fetch pending_review params
      const { data: pendingData } = await supabase
        .from("pid_parameters")
        .select("*")
        .eq("status", "pending_review");

      if (pendingData && pendingData.length > 0) {
        const kainPending = pendingData.find((p) => p.material_type === "Kain");
        const kulitPending = pendingData.find((p) => p.material_type === "Kulit");

        setPendingParams({
          kain: kainPending
            ? { kp: Number(kainPending.kp), ki: Number(kainPending.ki), kd: Number(kainPending.kd) }
            : null,
          kulit: kulitPending
            ? { kp: Number(kulitPending.kp), ki: Number(kulitPending.ki), kd: Number(kulitPending.kd) }
            : null,
        });
        setHasPending(true);
      } else {
        setPendingParams({ kain: null, kulit: null });
        setHasPending(false);
      }
    }

    fetchParams();

    // Realtime subscription untuk pid_parameters
    const channel = supabase
      .channel("realtime-pid")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "pid_parameters",
        },
        () => {
          // Refetch saat ada perubahan
          fetchParams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function approvePending() {
    // Ambil semua pending params
    const { data: pendingData } = await supabase
      .from("pid_parameters")
      .select("*")
      .eq("status", "pending_review");

    if (!pendingData || pendingData.length === 0) return;

    // Archive old active params, set pending to active
    for (const pending of pendingData) {
      // Archive old active param untuk material yang sama
      await supabase
        .from("pid_parameters")
        .update({ status: "archived" })
        .eq("material_type", pending.material_type)
        .eq("status", "active");

      // Set pending jadi active
      await supabase
        .from("pid_parameters")
        .update({ status: "active" })
        .eq("id", pending.id);
    }
  }

  async function rejectPending() {
    // Hapus atau archive pending params
    await supabase
      .from("pid_parameters")
      .update({ status: "archived" })
      .eq("status", "pending_review");
  }

  return {
    activeParams,
    pendingParams,
    hasPending,
    approvePending,
    rejectPending,
  };
}
