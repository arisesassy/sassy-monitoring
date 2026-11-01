import { ArrowRight, CircuitBoard, Database, Droplets, Flame, Thermometer } from "lucide-react";

export function ElectronicsFlow() {
  return (
    <section id="skema" aria-labelledby="skema-title" className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8 md:pb-32 lg:px-12">
      <div className="border-t border-[#DCE0D4] pt-16 md:pt-24">
        <h2 id="skema-title" className="max-w-[680px] text-[clamp(2.25rem,4.3vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.05em]">
          Dari alat ke <span className="text-[#6E8143]">dashboard.</span>
        </h2>
        <p className="mt-5 max-w-[52ch] text-base leading-[1.8] text-[#4F5949] sm:text-lg">
          Kondisi pengukusan dibaca oleh perangkat, lalu data proses dikirim untuk dipantau admin.
        </p>

        <figure className="mt-12 rounded-2xl border border-[#DCE0D4] bg-[#EEF1E9] p-5 sm:p-8 md:mt-16 lg:p-12">
          <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-6">
            <div className="min-w-0 md:px-2">
              <p className="text-xs font-semibold text-[#536431]">01 / Pengukusan</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">Kondisi alat</h3>
              <div className="mt-5 flex flex-wrap gap-2 text-sm text-[#3C4730]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#D2D9C9] px-3 py-1.5"><Thermometer aria-hidden="true" className="size-4" strokeWidth={1.8} /> Suhu</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#D2D9C9] px-3 py-1.5"><Droplets aria-hidden="true" className="size-4" strokeWidth={1.8} /> Level air</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#D2D9C9] px-3 py-1.5"><Flame aria-hidden="true" className="size-4" strokeWidth={1.8} /> Pembakaran</span>
              </div>
            </div>

            <ArrowRight aria-hidden="true" className="size-5 rotate-90 text-[#6E8143] md:rotate-0" strokeWidth={1.8} />

            <div className="min-w-0 rounded-2xl bg-[#536431] px-6 py-7 text-[#F8F9F5] shadow-[0_20px_40px_-28px_rgba(38,50,28,0.6)] md:px-7 md:py-9">
              <CircuitBoard aria-hidden="true" className="size-7" strokeWidth={1.8} />
              <p className="mt-7 text-xs font-medium text-[#DFE6D4]">02 / Perangkat</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">ESP32-S3</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#DFE6D4]">Mengirim telemetri melalui HTTP.</p>
            </div>

            <ArrowRight aria-hidden="true" className="size-5 rotate-90 text-[#6E8143] md:rotate-0" strokeWidth={1.8} />

            <div className="min-w-0 md:px-2">
              <Database aria-hidden="true" className="size-7 text-[#536431]" strokeWidth={1.8} />
              <p className="mt-7 text-xs font-semibold text-[#536431]">03 / Pemantauan</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Supabase</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4F5949]">Data telemetri tersedia di dashboard admin.</p>
            </div>
          </div>
          <figcaption className="mt-10 border-t border-[#D2D9C9] pt-4 text-xs leading-relaxed text-[#4F5949] md:mt-12">
            Skema alur konseptual, bukan diagram rangkaian atau panduan wiring. Detail sambungan menunggu skema elektronika final.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
