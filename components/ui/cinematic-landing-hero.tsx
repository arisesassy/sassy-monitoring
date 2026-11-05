"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Droplets, Flame, Thermometer } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OriginButton } from "@/components/ui/origin-button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const badgeStyle = "flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-[#1F281A]/80 px-3 py-2 text-[10px] font-semibold text-[#F8F9F5] shadow-[0_18px_36px_-18px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl md:justify-start md:px-4 md:py-2.5 md:text-xs";

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const title = "[data-hero-intro='title']";
        const detail = "[data-hero-intro='detail']";
        const copy = "[data-hero-copy]";
        const scene = "[data-hero-scene]";
        const badges = "[data-hero-badge]";
        const outro = "[data-hero-outro]";
        const outroCopy = "[data-hero-outro-copy]";

        gsap.set(title, { y: 26, filter: "blur(12px)" });
        gsap.set(detail, { y: 18 });
        gsap.set("[data-hero-accent]", { clipPath: "inset(0 100% 0 0)" });
        gsap.set(scene, { y: 34, scale: 0.975 });
        gsap.set(badges, { y: 14, scale: 0.92, opacity: 0 });
        gsap.set(outroCopy, { y: 16 });

        const intro = gsap.timeline({ delay: 0.2 });
        intro
          .to(title, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.15, ease: "expo.out" })
          .to("[data-hero-accent]", { clipPath: "inset(0 0% 0 0)", duration: 1.05, ease: "power4.inOut" }, "-=0.7")
          .to(detail, { opacity: 1, y: 0, duration: 0.75, stagger: 0.12, ease: "power3.out" }, "-=0.8");

        // Timeline scroll: teks keluar, alat masuk, badge menyusul, lalu semuanya memudar.
        const scroll = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * (window.innerWidth < 768 ? 1.4 : 2.2))}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        scroll
          .to(copy, { y: -44, autoAlpha: 0, duration: 0.12, ease: "power1.inOut" }, 0)
          .to(scene, { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: "power2.out" }, 0.06)
          .to(badges, { opacity: 1, y: 0, scale: 1, duration: 0.14, stagger: 0.03, ease: "power2.out" }, 0.16)
          .to(scene, { scale: 1.02, duration: 0.38, ease: "none" }, 0.36)
          .to(scene, { opacity: 0, y: -24, duration: 0.26, ease: "power1.inOut" }, 0.74)
          .to(outro, { autoAlpha: 1, duration: 0.16, ease: "power2.out" }, 0.84)
          .to(outroCopy, { y: 0, duration: 0.16, ease: "power2.out" }, 0.84);
      }, sectionRef);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-hero
      className="relative mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col px-5 pb-5 sm:px-8 md:pb-8 lg:px-12"
    >
      <noscript>
        <style>{`
          [data-hero-intro],
          [data-hero-scene] { opacity: 1 !important; }
          [data-hero-scene] {
            position: static !important;
            margin-top: 1.5rem;
            padding-inline: 0 !important;
          }
        `}</style>
      </noscript>

      <header className="relative z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-[#DCE0D4]">
        <Link href="/" className="text-lg font-extrabold tracking-[-0.05em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6E8143]">
          SASSY<span className="text-[#6E8143]">.</span>
        </Link>
        <OriginButton href="/login" variant="secondary" className="h-9 px-4">Masuk Admin</OriginButton>
      </header>

      <div data-hero-copy className="relative z-10 flex flex-1 flex-col justify-center pt-8 pb-24 md:pt-12 md:pb-32">
        <div className="max-w-[850px]">
          <h1 data-hero-intro="title" className="max-w-[820px] text-[clamp(2.6rem,5.6vw,5.5rem)] font-semibold leading-[1.04] tracking-[-0.06em]">
            Pengukusan lebih{" "}
            <span data-hero-accent className="inline-block text-[#6E8143]">terukur.</span>
          </h1>
          <p data-hero-intro="detail" className="mt-5 max-w-[540px] text-base leading-relaxed text-[#4F5949] sm:text-lg">
            SASSY memantau suhu, level air, dan pembakaran saat mengukus kain dan kulit.
          </p>
          <div data-hero-intro="detail" className="mt-7">
            <OriginButton href="#perangkat">Lihat perangkat</OriginButton>
          </div>
        </div>
      </div>

      <div
        data-hero-scene
        className="pointer-events-none absolute inset-0 z-20 flex items-center px-5 sm:px-8 lg:px-12"
      >
        <div className="relative mx-auto w-full max-w-[1100px]">
          <div id="perangkat" className="hero-stage relative h-[min(26dvh,220px)] min-h-[170px] scroll-mt-8 overflow-hidden rounded-[24px] md:h-[min(56dvh,512px)] md:min-h-[320px] md:rounded-[32px]">
            <Image
              src="/images/home-hero-device.webp"
              alt="Visual konseptual alat pengukusan SASSY dengan panel kendali di sisi kanan"
              fill
              priority
              sizes="(min-width: 1400px) 1100px, (min-width: 768px) 90vw, 100vw"
              className="object-contain px-1 py-3 md:px-4 md:py-5"
            />
            <span className="absolute right-3 bottom-3 text-[10px] font-medium text-[#DCE8C8]/60 md:right-5 md:bottom-4 md:text-[11px]">
              Visual konseptual
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 md:mt-0 md:block">
            <div data-hero-badge className="md:absolute md:-top-4 md:left-8">
              <div className={badgeStyle}>
                <Thermometer aria-hidden="true" className="size-3.5 shrink-0 text-[#C7D6A8] md:size-4" strokeWidth={1.8} />
                Pemantauan suhu
              </div>
            </div>
            <div data-hero-badge className="md:absolute md:top-[6%] md:-right-4">
              <div className={badgeStyle}>
                <Flame aria-hidden="true" className="size-3.5 shrink-0 text-[#C7D6A8] md:size-4" strokeWidth={1.8} />
                Kendali burner
              </div>
            </div>
            <div data-hero-badge className="col-span-2 md:absolute md:-bottom-4 md:left-16">
              <div className={badgeStyle}>
                <Droplets aria-hidden="true" className="size-3.5 shrink-0 text-[#C7D6A8] md:size-4" strokeWidth={1.8} />
                Level air terpantau
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        data-hero-outro
        className="pointer-events-none invisible absolute inset-0 z-20 bg-[#F8F9F5] opacity-0"
      >
        <div data-hero-outro-copy className="flex h-full items-center justify-center px-5 sm:px-8">
          <div className="max-w-[620px] text-center">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#536431] uppercase">Kenali lebih dekat</p>
            <h2 className="mt-4 text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.05em]">
              Saatnya melihat <span className="text-[#6E8143]">prosesnya.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[46ch] text-sm leading-relaxed text-[#4F5949] md:text-base">
              Kenali cara SASSY membaca suhu, level air, dan pembakaran, lalu mengirimnya ke dashboard admin.
            </p>
            <div className="mt-6 flex justify-center">
              <OriginButton href="#tentang" className="pointer-events-auto">Kenali SASSY</OriginButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
