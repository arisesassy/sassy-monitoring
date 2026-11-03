import type { Metadata } from "next";
import { CinematicHero } from "@/components/ui/cinematic-landing-hero";
import { AboutSassy } from "@/components/landing/about-sassy";
import { ElectronicsFlow } from "@/components/landing/electronics-flow";
import { KeyComponents } from "@/components/landing/key-components";
import { Faq } from "@/components/landing/faq";

export const metadata: Metadata = {
  title: "SASSY | Pengukusan Terukur",
  description: "Kenali SASSY, alat pengukusan kain dan kulit dengan pemantauan proses terintegrasi.",
};

export default function Home() {
  return (
    <main className="min-h-[100dvh] overflow-x-clip bg-[#F8F9F5] text-[#2B3024]">
      <CinematicHero />
      <AboutSassy />
      <ElectronicsFlow />
      <KeyComponents />
      <Faq />
    </main>
  );
}
