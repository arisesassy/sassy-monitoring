"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/dashboard/navbar";
import { AccountCard } from "@/components/profile/account-card";
import { UserManagementCard } from "@/components/profile/user-management-card";
import { TelemetryProvider } from "@/lib/hooks/use-telemetry";
import { SessionControlProvider } from "@/lib/hooks/use-session-control";
import { NotificationsProvider } from "@/lib/hooks/use-notifications";

export default function ProfilePage() {
  const router = useRouter();

  async function handleLogout() {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
    // Clear session cookie
    document.cookie = "sb-access-token=; path=/; max-age=0";
    router.push("/login");
  }

  return (
    <SessionControlProvider>
      <TelemetryProvider>
        <NotificationsProvider>
          <main
            className="min-h-screen p-6 md:p-10 flex flex-col items-center"
            style={{ backgroundColor: "#F8F9F5" }}
          >
            <div className="w-full max-w-6xl space-y-8">
              <Navbar />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <AccountCard
                  role="Operator"
                  deviceName="ESP32-S3"
                  onLogout={handleLogout}
                />
                <UserManagementCard
                  initialName="Operator"
                  initialUsername="operator"
                />
              </div>
            </div>
          </main>
        </NotificationsProvider>
      </TelemetryProvider>
    </SessionControlProvider>
  );
}
