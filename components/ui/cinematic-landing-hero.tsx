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

const badgeStyle = "flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-[#1F281A]/80 px-3 py-3 text-xs font-semibold text-[#F8F9F5] shadow-[0_18px_36px_-18px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl md:justify-start md:gap-3 md:px-6 md:py-4 md:text-lg [&>svg]:size-4 [&>svg]:md:size-6";

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
        const device = "[data-hero-device]";
        const stage = "[data-hero-stage]";
        const anchor = sectionRef.current!.querySelector<HTMLElement>("#perangkat")!;

        gsap.set(title, { y: 26, filter: "blur(12px)" });
        gsap.set(detail, { y: 18 });
        gsap.set("[data-hero-accent]", { clipPath: "inset(0 100% 0 0)" });
        gsap.set(scene, { y: () => window.innerHeight * 1.15 });
        gsap.set(stage, { scaleX: 0.92, scaleY: 0.82, borderRadius: 32 });
        // ponytail: perspective pada foto 2D; sisi alat baru memerlukan model GLB.
        gsap.set(device, { y: 90, z: -180, rotationX: 12, rotationY: -10, scale: 0.82, opacity: 0 });
        gsap.set(badges, { y: 24, rotation: (index: number) => index % 2 ? 4 : -4, scale: 0.9, opacity: 0 });

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
            end: () => `+=${Math.round(window.innerHeight * (window.innerWidth < 768 ? 2 : 3.6))}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: (trigger) => {
              anchor.dataset.scrollPosition = String(trigger.start + (trigger.end - trigger.start) * 0.55);
            },
          },
        });

        scroll
          .to(copy, { scale: 1.06, filter: "blur(16px)", duration: 0.2, ease: "power1.inOut" }, 0)
          .to(scene, { y: 0, duration: 0.22, ease: "power2.inOut" }, 0)
          .to(stage, { scaleX: 1, scaleY: 1, borderRadius: 0, duration: 0.12, ease: "power2.inOut" }, 0.22)
          // Ganti teks hanya ketika wrapper memenuhi viewport; set bersifat reversible.
          .set(copy, { visibility: "hidden" }, 0.34)
          .set(outro, { visibility: "visible" }, 0.34)
          .to(device, { opacity: 1, y: 0, z: 0, rotationX: 0, rotationY: -2, scale: 1, duration: 0.16, ease: "power3.out" }, 0.3)
          .to(badges, { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.08, stagger: 0.025, ease: "power2.out" }, 0.42)
          .to([device, badges], { opacity: 0, scale: 0.88, y: -24, duration: 0.12, ease: "power2.in" }, 0.66)
          .to(stage, { scaleX: 0.92, scaleY: 0.82, borderRadius: 32, duration: 0.1, ease: "power2.inOut" }, 0.78)
          .to(scene, { y: () => -window.innerHeight * 1.15, duration: 0.12, ease: "power2.inOut" }, 0.88);
        if (location.hash === "#perangkat") window.scrollTo(0, Number(anchor.dataset.scrollPosition));
        return () => { delete anchor.dataset.scrollPosition; };
      }, sectionRef);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-hero
      className="relative flex min-h-[100dvh] flex-col overflow-hidden px-5 pb-5 sm:px-8 md:pb-8 lg:px-12"
    >
      <noscript>
        <style>{`
          [data-hero-intro],
          [data-hero-scene] { opacity: 1 !important; }
          [data-hero-scene] {
            position: relative !important;
            transform: none !important;
            margin-top: 1.5rem;
            padding-inline: 0 !important;
          }
          [data-hero-stage] { border-radius: 24px; }
          [data-hero-scene] { padding-block: 3rem; }
        `}</style>
      </noscript>

      <header className="relative z-10 mx-auto flex h-[72px] w-full max-w-[1304px] shrink-0 items-center justify-between border-b border-[#DCE0D4]">
        <Link href="/" className="text-lg font-extrabold tracking-[-0.05em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6E8143]">
          SASSY<span className="text-[#6E8143]">.</span>
        </Link>
        <OriginButton href="/login" variant="secondary" className="h-9 px-4">Masuk Admin</OriginButton>
      </header>

      <div data-hero-copy className="relative z-10 mx-auto flex w-full max-w-[1304px] flex-1 flex-col justify-center py-10 md:pb-20">
        <div className="max-w-[1200px]">
          <h1 data-hero-intro="title" className="text-[clamp(3.2rem,8.5vw,8rem)] font-semibold leading-[1.02] tracking-[-0.06em]">
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
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      >
        <div data-hero-stage className="hero-stage absolute inset-0" />
        <div id="perangkat" className="relative mx-auto w-[90%] max-w-[1400px] [perspective:1200px]">
          <div data-hero-device className="relative aspect-[2.15/1] w-full">
            <Image
              src="/images/home-hero-device.webp"
              alt="Visual konseptual alat pengukusan SASSY dengan panel kendali di sisi kanan"
              fill
              priority
              sizes="(min-width: 1556px) 1400px, 90vw"
              className="object-contain px-1 py-3 md:px-4 md:py-5"
            />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 md:mt-0 md:block">
            <div data-hero-badge className="md:absolute md:-top-4 md:left-8">
              <div className={badgeStyle}>
                <Thermometer aria-hidden="true" className="shrink-0 text-[#C7D6A8]" strokeWidth={1.8} />
                Pemantauan suhu
              </div>
            </div>
            <div data-hero-badge className="md:absolute md:top-[6%] md:-right-4">
              <div className={badgeStyle}>
                <Flame aria-hidden="true" className="shrink-0 text-[#C7D6A8]" strokeWidth={1.8} />
                Kendali burner
              </div>
            </div>
            <div data-hero-badge className="col-span-2 md:absolute md:-bottom-4 md:left-16">
              <div className={badgeStyle}>
                <Droplets aria-hidden="true" className="shrink-0 text-[#C7D6A8]" strokeWidth={1.8} />
                Level air terpantau
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        data-hero-outro
        className="pointer-events-none invisible absolute inset-0 z-10"
      >
        <div data-hero-outro-copy className="flex h-full items-center justify-center px-5 sm:px-8">
          <div className="max-w-[1100px] text-center">
            <h2 className="text-[clamp(3rem,7.5vw,7rem)] font-semibold leading-[1.04] tracking-[-0.05em]">
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
