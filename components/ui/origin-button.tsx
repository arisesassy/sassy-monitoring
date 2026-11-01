"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

// Adaptasi OriginButton: navigasi memakai link semantik, bukan button bersarang.
export function OriginButton({ href, children, className, variant = "primary" }: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0, size: 0 });
  const [active, setActive] = useState(false);
  const reducedMotion = useReducedMotion();

  function setCenter() {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setOrigin({ x: rect.width / 2, y: rect.height / 2, size: Math.hypot(rect.width, rect.height) * 2 });
  }

  return (
    <MotionLink
      ref={ref}
      href={href}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const size = 2 * Math.max(Math.hypot(x, y), Math.hypot(rect.width - x, y), Math.hypot(x, rect.height - y), Math.hypot(rect.width - x, rect.height - y));
        setOrigin({ x, y, size });
        setActive(true);
      }}
      onPointerLeave={() => setActive(false)}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) {
          setCenter();
          setActive(true);
        }
      }}
      onBlur={() => setActive(false)}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      className={cn("relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full border px-6 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#536431]", variant === "primary" ? "border-[#536431] bg-[#536431] text-white hover:bg-[#2B3920] focus-visible:bg-[#2B3920]" : "border-[#DCE0D4] bg-[#F8F9F5] text-[#2B3024] hover:bg-[#2B3920] hover:text-white focus-visible:bg-[#2B3920] focus-visible:text-white", className)}
    >
      {!reducedMotion && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-[#2B3920]"
          initial={false}
          animate={{ scale: active ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: origin.size, height: origin.size, left: origin.x - origin.size / 2, top: origin.y - origin.size / 2 }}
        />
      )}
      <span className="relative whitespace-nowrap">{children}</span>
    </MotionLink>
  );
}
