"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Droplets, Flame, Thermometer } from "lucide-react";
import { OriginButton } from "@/components/ui/origin-button";

const badgeStyle = "flex items-center gap-2 rounded-2xl border border-white/80 bg-[#F8F9F5]/90 px-3 py-2.5 text-xs font-semibold text-[#2B3024] shadow-[0_12px_28px_-18px_rgba(26,39,20,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md md:px-4 md:py-3";

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

            gsap.from("[data-hero-device]", {
              y: 24,
              scale: 0.97,
              opacity: 0,
              duration: 0.85,
              ease: "power2.out",
            });

            // ponytail: foto 2D hanya bergerak naik dan memudar; rotasi perangkat perlu model 3D asli.
            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: () => `+=${Math.round(window.innerHeight * 0.85)}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });
            timeline
              .fromTo("[data-hero-badge]", { y: 16, scale: 0.95, opacity: 0 }, {
                y: 0, scale: 1, opacity: 1, duration: 0.25, stagger: 0.09, ease: "none",
              })
              .to({}, { duration: 0.18 })
              .to("[data-hero-scene]", { y: -28, scale: 0.97, opacity: 0, duration: 0.3, ease: "none" });
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
    <section ref={sectionRef} className="mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col px-5 pb-6 sm:px-8 lg:px-12">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#DCE0D4]">
          <Link href="/" className="text-lg font-extrabold tracking-[-0.05em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6E8143]">
            SASSY<span className="text-[#6E8143]">.</span>
          </Link>
          <OriginButton href="/login" variant="secondary" className="h-9 px-4">Masuk Admin</OriginButton>
        </header>

         <div className="flex flex-1 flex-col justify-center pt-5 pb-5 md:pt-8 md:pb-6">
          <div className="max-w-[850px]">
            <h1 data-hero-intro className="max-w-[820px] text-[clamp(2.6rem,5.6vw,5.5rem)] font-semibold leading-[1.04] tracking-[-0.06em]">
              Pengukusan lebih <span className="text-[#6E8143]">terukur.</span>
            </h1>
            <p data-hero-intro className="mt-5 max-w-[540px] text-base leading-relaxed text-[#4F5949] sm:text-lg">
              SASSY memantau suhu, level air, dan pembakaran saat mengukus kain dan kulit.
            </p>
            <div data-hero-intro className="mt-7">
              <OriginButton href="#perangkat">Lihat perangkat</OriginButton>
            </div>
          </div>
        </div>

         <div id="perangkat" data-hero-scene className="relative scroll-mt-8 pb-2">
           <div className="relative h-[min(27dvh,240px)] min-h-[180px] rounded-2xl border border-[#DCE0D4] bg-[#E8EEE0] md:h-[min(42dvh,440px)] md:min-h-[260px]">
             <div data-hero-device className="absolute inset-0 overflow-hidden rounded-2xl">
               <Image
                 src="/images/home-hero.webp"
                 alt="Visual konseptual alat pengukusan SASSY dengan panel kendali di sisi kanan"
                 fill
                 priority
                 sizes="(min-width: 1400px) 1304px, (min-width: 768px) 92vw, 100vw"
                 className="object-contain scale-[1.15] md:scale-[1.65] lg:scale-[1.8]"
               />
             </div>
             <span className="absolute bottom-3 left-3 rounded-full bg-[#F8F9F5]/90 px-3 py-1 text-[11px] font-medium text-[#3B472D] md:bottom-5 md:left-6">
               Visual konseptual
             </span>
           </div>

           <div className="mt-3 grid grid-cols-2 gap-2 md:mt-0 md:block">
             <div data-hero-badge className="md:absolute md:top-[12%] md:left-[5%]">
               <div className={badgeStyle}>
                 <Thermometer aria-hidden="true" className="size-4 shrink-0 text-[#536431]" strokeWidth={1.8} />
                 Pemantauan suhu
               </div>
             </div>
             <div data-hero-badge className="md:absolute md:top-[6%] md:right-[4%]">
               <div className={badgeStyle}>
                 <Flame aria-hidden="true" className="size-4 shrink-0 text-[#536431]" strokeWidth={1.8} />
                 Kendali burner
               </div>
             </div>
             <div data-hero-badge className="col-span-2 md:absolute md:bottom-[10%] md:left-[7%]">
               <div className={badgeStyle}>
                 <Droplets aria-hidden="true" className="size-4 shrink-0 text-[#536431]" strokeWidth={1.8} />
                 Level air terpantau
               </div>
             </div>
           </div>
         </div>
    </section>
  );
}
