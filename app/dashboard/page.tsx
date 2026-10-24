import { Navbar } from "@/components/dashboard/navbar";
import { MetricsRow } from "@/components/dashboard/metrics-row";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { ControlsSection } from "@/components/dashboard/controls-section";

export const metadata = {
  title: "Dashboard — SASSY Monitoring",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6 md:p-8 flex justify-center" style={{ backgroundColor: "#F6F7F2" }}>
      <div className="w-full max-w-[1280px] flex flex-col gap-6">
        <Navbar />
        <MetricsRow />
        <ChartsSection />
        <ControlsSection />
      </div>
    </main>
  );
}
