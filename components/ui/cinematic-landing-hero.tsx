"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Droplets, Flame, Thermometer } from "lucide-react";
import { OriginButton } from "@/components/ui/origin-button";

const badgeStyle = "flex items-center gap-2.5 rounded-2xl border border-white/70 bg-[#F8F9F5]/90 px-3.5 py-3 text-xs font-semibold text-[#2B3024] shadow-[0_16px_30px_-18px_rgba(26,39,20,0.6),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-[transform,box-shadow,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white hover:shadow-[0_26px_40px_-18px_rgba(26,39,20,0.6)] hover:[transform:translate3d(0,-9px,18px)_rotateX(5deg)_rotateY(-4deg)_scale(1.04)] md:px-4 md:py-3.5 motion-reduce:transition-none motion-reduce:hover:transform-none";

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

            // ponytail: badge bergerak mengitari foto 2.5D; ganti dengan posisi model 3D saat aset GLB tersedia.
            gsap.fromTo("[data-hero-badge]", {
              x: (index: number) => [-85, 90, -70][index],
              y: (index: number) => [-45, -30, 65][index],
              rotationY: (index: number) => [-20, 22, -16][index],
              rotationX: 12,
              scale: 0.8,
              opacity: 0,
            }, {
              x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, opacity: 1,
              ease: "power2.out",
              stagger: 0.12,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top top",
                end: () => `+=${Math.round(window.innerHeight * 0.65)}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
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
          <OriginButton href="/login" variant="secondary" className="h-9 px-4">Masuk Admin</OriginButton>
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
              <OriginButton href="#perangkat">Lihat perangkat</OriginButton>
            </div>
          </div>
        </div>

        <div id="perangkat" className="relative scroll-mt-8 pb-2 [perspective:1200px]">
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
            <div className="absolute bottom-5 left-5 hidden text-xs font-medium text-white md:block md:bottom-7 md:left-7">
              SASSY · Sistem pengukusan kain &amp; kulit
            </div>
          </div>

          <div data-hero-badge className="absolute -top-5 left-3 sm:left-8 md:-top-7 md:left-12">
            <div className={badgeStyle}>
              <Thermometer aria-hidden="true" className="size-4 text-[#536431]" strokeWidth={1.8} />
              Pemantauan suhu
            </div>
          </div>
          <div data-hero-badge className="absolute top-1/3 right-2 sm:right-8 md:-right-4">
            <div className={badgeStyle}>
              <Flame aria-hidden="true" className="size-4 text-[#536431]" strokeWidth={1.8} />
              Kendali burner
            </div>
          </div>
          <div data-hero-badge className="absolute -bottom-3 right-3 sm:right-8 md:bottom-8 md:right-10">
            <div className={badgeStyle}>
              <Droplets aria-hidden="true" className="size-4 text-[#536431]" strokeWidth={1.8} />
              Level air terpantau
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
