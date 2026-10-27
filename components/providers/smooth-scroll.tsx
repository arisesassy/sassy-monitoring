"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      wheelMultiplier: 1,
    });

    let stopped = false;
    let frameId = 0;

    function raf(time: number) {
      if (stopped) return;
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    // Prevent default scroll behavior agar Lenis handle sepenuhnya
    const handleWheel = (e: WheelEvent) => {
      // Jika Lenis aktif, biarkan Lenis handle
      if (lenis.isScrolling) e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Jika Lenis aktif, biarkan Lenis handle
      if (lenis.isScrolling) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      stopped = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
