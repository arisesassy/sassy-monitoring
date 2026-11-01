import type { Metadata } from "next";
import { CinematicHero } from "@/components/ui/cinematic-landing-hero";

export const metadata: Metadata = {
  title: "SASSY | Pengukusan Terukur",
  description: "Kenali SASSY, alat pengukusan kain dan kulit dengan pemantauan proses terintegrasi.",
};

export default function Home() {
  return <CinematicHero />;
}
