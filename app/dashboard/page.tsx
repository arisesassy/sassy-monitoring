import { Navbar } from "@/components/dashboard/navbar";
import { MetricsRow } from "@/components/dashboard/metrics-row";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { ControlsMount } from "@/components/dashboard/controls-mount";
import { DeviceAlertBanner } from "@/components/dashboard/device-alert-banner";
import { OfflineBanner } from "@/components/dashboard/offline-banner";
import { AuthGuard } from "@/components/providers/auth-guard";
import { TelemetryProvider } from "@/lib/hooks/use-telemetry";
import { PidParametersProvider } from "@/lib/hooks/use-pid-parameters";
import { SessionControlProvider } from "@/lib/hooks/use-session-control";
import { NotificationsProvider } from "@/lib/hooks/use-notifications";

export const metadata = {
  title: "Dashboard — SASSY Monitoring",
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <TelemetryProvider>
        <PidParametersProvider>
          <SessionControlProvider>
            <NotificationsProvider>
              <main
                className="min-h-screen p-6 md:p-8 pb-16 flex justify-center"
                style={{ backgroundColor: "#F6F7F2" }}
              >
                <div className="w-full max-w-[1280px] flex flex-col gap-6">
                  <Navbar />
                  <DeviceAlertBanner />
                  <OfflineBanner />
                  <MetricsRow />
                  <ChartsSection />
                  <ControlsMount />
                </div>
              </main>
            </NotificationsProvider>
          </SessionControlProvider>
        </PidParametersProvider>
      </TelemetryProvider>
    </AuthGuard>
  );
}
