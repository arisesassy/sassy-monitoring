import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SASSY Monitoring",
  description: "IoT Monitoring Dashboard untuk Sistem Pengukusan SASSY",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={cn("h-full antialiased", jakarta.variable)}>
      <body className="min-h-full flex flex-col font-sans bg-brand-bg text-foreground selection:bg-brand-green selection:text-white">
        {children}
      </body>
    </html>
  );
}

