"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      wheelMultiplier: 1,
      smoothWheel: !reduce.matches,
    });
    lenis.on("scroll", ScrollTrigger.update);

    let stopped = false;
    let frameId = 0;

    function raf(time: number) {
      if (stopped) return;
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    const handleAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      let id: string;
      try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const position = Number(target.dataset.scrollPosition);
      lenis.scrollTo(Number.isFinite(position) ? position : target, {
        immediate: reduce.matches,
        onComplete: () => {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        },
      });
      history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", handleAnchor, true);

    return () => {
      stopped = true;
      cancelAnimationFrame(frameId);
      document.removeEventListener("click", handleAnchor, true);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
