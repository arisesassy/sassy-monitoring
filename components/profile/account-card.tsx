"use client";

interface AccountCardProps {
  role: string;
  deviceName: string;
  onLogout: () => void;
}

export function AccountCard({ role, deviceName, onLogout }: AccountCardProps) {
  return (
    <section className="md:col-span-5 bg-[#F4F5F0] rounded-3xl p-8 sm:p-9 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#ECEEE7]">
      <h2 className="text-2xl font-bold text-[#556338] mb-6 tracking-tight">Akun</h2>

      <div className="space-y-4 text-base">
        {/* Detail 1: Role */}
        <div className="flex justify-between items-center text-[#686E5D] pb-3 border-b border-[#E0E4D7]">
          <span>Masuk sebagai</span>
          <span className="font-bold text-[#54603B]">{role}</span>
        </div>

        {/* Detail 2: Device */}
        <div className="flex justify-between items-center text-[#686E5D] pb-3 border-b border-[#E0E4D7]">
          <span>Perangkat</span>
          <span className="font-bold text-[#54603B] tracking-wide">{deviceName}</span>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-8">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3.5 px-6 rounded-full bg-[#D96E63] hover:bg-[#cb6156] active:scale-[0.99] text-white font-medium text-center shadow-[0_2px_8px_rgba(217,110,99,0.3)] transition-all cursor-pointer"
        >
          Keluar
        </button>
      </div>
    </section>
  );
}
