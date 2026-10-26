"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

interface PidParametersContextType {
  activeParams: {
    kain: PidParams;
    kulit: PidParams;
  };
  pendingParams: {
    kain: PidParams | null;
    kulit: PidParams | null;
  };
  hasPending: boolean;
  approvePending: () => Promise<void>;
  rejectPending: () => Promise<void>;
}

const PidParametersContext = createContext<PidParametersContextType>({
  activeParams: {
    kain: { kp: 8.0, ki: 0.08, kd: 10.0 },
    kulit: { kp: 6.5, ki: 0.05, kd: 8.0 },
  },
  pendingParams: { kain: null, kulit: null },
  hasPending: false,
  approvePending: async () => {},
  rejectPending: async () => {},
});

export function PidParametersProvider({ children }: { children: ReactNode }) {
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
    let isMounted = true;

    async function fetchParams() {
      const { data: activeData } = await supabase
        .from("pid_parameters")
        .select("*")
        .eq("status", "active");

      if (activeData && isMounted) {
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

      const { data: pendingData } = await supabase
        .from("pid_parameters")
        .select("*")
        .eq("status", "pending_review");

      if (isMounted) {
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
    }

    fetchParams();

    const channelName = `realtime-pid-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pid_parameters",
        },
        () => {
          if (isMounted) fetchParams();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  async function approvePending() {
    const { data: pendingData } = await supabase
      .from("pid_parameters")
      .select("*")
      .eq("status", "pending_review");

    if (!pendingData || pendingData.length === 0) return;

    for (const pending of pendingData) {
      await supabase
        .from("pid_parameters")
        .update({ status: "archived" })
        .eq("material_type", pending.material_type)
        .eq("status", "active");

      await supabase
        .from("pid_parameters")
        .update({ status: "active" })
        .eq("id", pending.id);
    }
  }

  async function rejectPending() {
    await supabase
      .from("pid_parameters")
      .update({ status: "archived" })
      .eq("status", "pending_review");
  }

  return (
    <PidParametersContext.Provider
      value={{
        activeParams,
        pendingParams,
        hasPending,
        approvePending,
        rejectPending,
      }}
    >
      {children}
    </PidParametersContext.Provider>
  );
}

export function usePidParameters() {
  return useContext(PidParametersContext);
}
