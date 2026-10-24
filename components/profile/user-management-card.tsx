"use client";

import { useState } from "react";

interface UserManagementCardProps {
  initialName?: string;
  initialUsername?: string;
}

export function UserManagementCard({
  initialName = "Operator",
  initialUsername = "operator",
}: UserManagementCardProps) {
  const [name, setName] = useState(initialName);
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simulate save — later update via Supabase auth API
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  }

  function handleReset() {
    setName(initialName);
    setUsername(initialUsername);
    setPassword("");
  }

  return (
    <section className="md:col-span-7 bg-[#F4F5F0] rounded-3xl p-8 sm:p-9 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#ECEEE7]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#556338] tracking-tight">Pengguna</h2>
        <button
          type="button"
          className="px-5 py-1.5 rounded-full border border-[#78855A] text-[#616D43] hover:bg-[#EBECE4] text-sm font-medium tracking-wide transition-colors cursor-pointer"
        >
          + Tambah
        </button>
      </div>

      {/* Active User Row */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#728248] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#4B5731] leading-snug">{name}</h3>
            <p className="text-sm text-[#7F876E]">@{username}</p>
          </div>
        </div>
        <span className="bg-[#728248] text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm">
          Anda
        </span>
      </div>

      {/* Edit Form */}
      <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
        {/* Field: Nama */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#657053]" htmlFor="nama">
            Nama
          </label>
          <input
            id="nama"
            name="nama"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-5 rounded-full border-[1.5px] border-[#A8B294] focus:border-[#728248] focus:ring-2 focus:ring-[#728248]/15 outline-none text-sm text-[#3F482B] bg-transparent transition"
          />
        </div>

        {/* Field: Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#657053]" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-10 px-5 rounded-full border-[1.5px] border-[#A8B294] focus:border-[#728248] focus:ring-2 focus:ring-[#728248]/15 outline-none text-sm text-[#3F482B] bg-transparent transition"
          />
        </div>

        {/* Field: Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#657053]" htmlFor="password">
            Password Baru
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Biarkan kosong jika tidak ingin diubah"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-5 rounded-full border-[1.5px] border-[#A8B294] focus:border-[#728248] focus:ring-2 focus:ring-[#728248]/15 outline-none text-sm text-[#3F482B] bg-transparent transition placeholder:text-gray-400 placeholder:text-xs"
          />
        </div>

        {savedMessage && (
          <p className="text-xs text-[#556338] font-semibold">
            ✓ Perubahan berhasil disimpan
          </p>
        )}

        {/* Form Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="w-1/2 py-2.5 rounded-full border border-[#8C9872] text-[#5E6A44] hover:bg-[#EBECE4] font-medium text-center transition-colors cursor-pointer text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-1/2 py-2.5 rounded-full bg-[#728248] hover:bg-[#64723e] text-white font-medium text-center shadow-sm transition-all cursor-pointer text-sm"
          >
            Simpan
          </button>
        </div>
      </form>
    </section>
  );
}
