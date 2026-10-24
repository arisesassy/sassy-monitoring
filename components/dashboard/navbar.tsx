"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

const dummyNotifications = [
  { id: 1, text: "PID baru tersedia untuk ditinjau", time: "2 menit lalu", unread: true },
  { id: 2, text: "Suhu melebihi batas target 5°C", time: "15 menit lalu", unread: true },
  { id: 3, text: "Sesi pengukusan #42 selesai", time: "1 jam lalu", unread: false },
  { id: 4, text: "Level air rendah terdeteksi", time: "3 jam lalu", unread: false },
];

const dummyProfile = {
  name: "Admin SASSY",
  email: "admin@sassy.local",
  role: "Administrator",
};

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Riwayat", href: "/history" },
    { label: "Akun", href: "/profile" },
  ];

  const unreadCount = dummyNotifications.filter((n) => n.unread).length;

  // Close popover on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className={cn("w-full flex items-center justify-between relative px-2 mb-2", className)}>
      <div className="flex-1" />
      <nav className="bg-[#FAFAF7] rounded-full p-1.5 flex items-center shadow-sm border border-gray-100">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-medium px-8 py-2.5 rounded-full text-sm sm:text-base transition",
                isActive
                  ? "bg-[#6E8143] text-white shadow-sm tracking-wide"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 flex justify-end items-center gap-3">
        {/* Notification Icon */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="w-11 h-11 rounded-full bg-[#EFEFEA] border border-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:bg-[#E5E6DF] transition relative"
            aria-label="Notifikasi"
          >
            {/* Bell icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#D96B60] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover */}
          {showNotif && (
            <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Notifikasi</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {dummyNotifications.map((n) => (
                  <div key={n.id} className={cn("px-4 py-3 border-b border-gray-50 last:border-0", n.unread && "bg-[#F5F7EE]")}>
                    <p className="text-xs text-gray-800 font-medium">{n.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="w-12 h-12 rounded-full bg-[#6E8143] shadow-sm flex items-center justify-center cursor-pointer hover:bg-[#5E7036] transition text-white text-sm font-bold"
            aria-label="Profil"
          >
            {dummyProfile.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </button>

          {/* Profile Popover */}
          {showProfile && (
            <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6E8143] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {dummyProfile.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{dummyProfile.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{dummyProfile.email}</p>
                </div>
              </div>
              <div className="px-4 py-2">
                <p className="text-[11px] text-gray-400 font-medium">{dummyProfile.role}</p>
              </div>
              <div className="border-t border-gray-100">
                <Link
                  href="/profile"
                  onClick={() => setShowProfile(false)}
                  className="block px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Pengaturan Akun
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const { supabase } = await import("@/lib/supabase");
                    await supabase.auth.signOut();
                    document.cookie = "sb-access-token=; path=/; max-age=0";
                    window.location.href = "/login";
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#D96B60] hover:bg-red-50 transition cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
