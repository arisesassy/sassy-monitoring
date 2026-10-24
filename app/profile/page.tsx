"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/dashboard/navbar";
import { AccountCard } from "@/components/profile/account-card";
import { UserManagementCard } from "@/components/profile/user-management-card";

export default function ProfilePage() {
  const router = useRouter();

  function handleLogout() {
    // Later: await supabase.auth.signOut()
    router.push("/login");
  }

  return (
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
  );
}
