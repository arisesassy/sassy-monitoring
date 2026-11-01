"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Droplets, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    async function animate() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed || !sectionRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const context = gsap.context(() => {
            gsap.from("[data-hero-intro]", {
              y: 20,
              opacity: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: "power2.out",
            });

            gsap.fromTo(
              "[data-hero-visual]",
              { y: 28, scale: 0.96, rotationX: 5 },
              {
                y: 0,
                scale: 1,
                rotationX: 0,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: "[data-hero-visual]",
                  start: "top 90%",
                  end: "top 35%",
                  scrub: 1,
                },
              }
            );

            gsap.from("[data-hero-badge]", {
              y: 20,
              opacity: 0,
              duration: 0.7,
              stagger: 0.14,
              ease: "power2.out",
              scrollTrigger: {
                trigger: "[data-hero-visual]",
                start: "top 65%",
                once: true,
              },
            });
          }, sectionRef);
          return () => context.revert();
        }
      );
      cleanup = () => media.revert();
    }

    void animate();
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <main className="min-h-[100dvh] overflow-x-clip bg-[#F8F9F5] text-[#2B3024]">
      <section ref={sectionRef} className="mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col px-5 pb-6 sm:px-8 lg:px-12">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#DCE0D4]">
          <Link href="/" className="text-lg font-extrabold tracking-[-0.05em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6E8143]">
            SASSY<span className="text-[#6E8143]">.</span>
          </Link>
          <Button asChild variant="ghost" className="text-[#3C4730] hover:bg-[#EBEEE4] hover:text-[#2B3024] focus-visible:ring-[#6E8143]">
            <Link href="/login">Masuk Admin <ArrowUpRight aria-hidden="true" /></Link>
          </Button>
        </header>

        <div className="flex flex-1 flex-col justify-center pt-10 pb-8 md:pt-14 md:pb-10">
          <div className="max-w-[850px]">
            <h1 data-hero-intro className="max-w-[820px] text-[clamp(2.6rem,5.6vw,5.5rem)] font-semibold leading-[1.04] tracking-[-0.06em]">
              Pengukusan lebih <span className="text-[#6E8143]">terukur.</span>
            </h1>
            <p data-hero-intro className="mt-5 max-w-[540px] text-base leading-relaxed text-[#4F5949] sm:text-lg">
              SASSY memantau suhu, level air, dan pembakaran saat mengukus kain dan kulit.
            </p>
            <div data-hero-intro className="mt-7">
              <Button asChild className="h-11 rounded-full bg-[#536431] px-6 text-sm text-white hover:bg-[#435127] focus-visible:ring-[#536431]">
                <a href="#perangkat">Lihat perangkat <ArrowDownRight aria-hidden="true" /></a>
              </Button>
            </div>
          </div>
        </div>

        <div id="perangkat" className="relative scroll-mt-8 pb-2 md:[perspective:1200px]">
          <div data-hero-visual className="relative h-[min(42dvh,450px)] min-h-[270px] overflow-hidden rounded-2xl bg-[#DCE0D4] shadow-[0_22px_50px_-30px_rgba(38,50,28,0.45)] md:transform-3d">
            <Image
              src="/images/login-hero.webp"
              alt="Alat pengukusan SASSY di ruang kerja"
              fill
              priority
              sizes="(min-width: 1400px) 1304px, (min-width: 768px) 92vw, 100vw"
              className="object-cover object-center"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E291C]/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 text-xs font-medium text-white sm:bottom-7 sm:left-7">
              SASSY · Sistem pengukusan kain &amp; kulit
            </div>
          </div>

          <div data-hero-badge className="absolute -top-5 right-3 hidden items-center gap-2 rounded-xl border border-white/60 bg-[#F8F9F5]/90 px-4 py-3 text-xs font-semibold text-[#2B3024] shadow-[0_12px_28px_-16px_rgba(38,50,28,0.5)] backdrop-blur-md sm:flex sm:right-8 md:right-10 motion-reduce:transform-none">
            <Thermometer aria-hidden="true" className="size-4 text-[#536431]" strokeWidth={1.8} />
            Pemantauan suhu
          </div>
          <div data-hero-badge className="absolute -bottom-3 right-8 hidden items-center gap-2 rounded-xl border border-white/60 bg-[#F8F9F5]/90 px-4 py-3 text-xs font-semibold text-[#2B3024] shadow-[0_12px_28px_-16px_rgba(38,50,28,0.5)] backdrop-blur-md md:flex md:right-16 motion-reduce:transform-none">
            <Droplets aria-hidden="true" className="size-4 text-[#536431]" strokeWidth={1.8} />
            Level air terpantau
          </div>
        </div>
      </section>
    </main>
  );
}
