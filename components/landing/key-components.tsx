import Image from "next/image";
import { CircuitBoard, Flame, Thermometer } from "lucide-react";

export function KeyComponents() {
  return (
    <section id="komponen" aria-labelledby="komponen-title" className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8 md:pb-32 lg:px-12">
      <div className="border-t border-[#DCE0D4] pt-16 md:pt-24">
        <h2 id="komponen-title" className="max-w-[720px] text-[clamp(2.25rem,4.3vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.05em]">
          Bagian penting di balik <span className="text-[#6E8143]">pengukusan.</span>
        </h2>
        <p className="mt-5 max-w-[52ch] text-base leading-[1.8] text-[#4F5949] sm:text-lg">
          Perangkat membaca kondisi proses, mengatur pembakaran, dan mengirim data untuk dipantau admin.
        </p>

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-4">
          <figure className="relative min-h-72 overflow-hidden rounded-2xl bg-[#DCE0D4] md:col-span-2 md:min-h-96 lg:row-span-2">
            <Image
              src="/images/login-hero.webp"
              alt="Alat pengukusan SASSY dengan panel kendali di sisi kanan"
              fill
              sizes="(min-width: 1400px) 644px, (min-width: 1024px) 46vw, (min-width: 768px) 92vw, 100vw"
              className="object-cover object-[68%_center]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#1E291C]/75 via-transparent to-transparent" />
            <figcaption className="absolute right-6 bottom-6 left-6 text-sm font-medium text-white">
              Unit pengukusan · visual alat sementara
            </figcaption>
          </figure>

          <article className="flex min-h-64 flex-col rounded-2xl bg-[#536431] p-7 text-[#F8F9F5] sm:p-8">
            <CircuitBoard aria-hidden="true" className="size-8" strokeWidth={1.8} />
            <div className="mt-auto pt-12">
              <h3 className="text-xl font-semibold tracking-[-0.03em]">ESP32-S3</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#E4EBD9]">Mengirim data telemetri alat ke Supabase melalui HTTP.</p>
            </div>
          </article>

          <article className="flex min-h-64 flex-col rounded-2xl border border-[#DCE0D4] bg-[#EEF1E9] p-7 sm:p-8">
            <Thermometer aria-hidden="true" className="size-8 text-[#536431]" strokeWidth={1.8} />
            <div className="mt-auto pt-12">
              <h3 className="text-xl font-semibold tracking-[-0.03em]">Pembacaan kondisi</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4F5949]">Suhu dan level air menjadi bagian dari data proses yang dipantau.</p>
            </div>
          </article>

          <article className="flex min-h-48 flex-col rounded-2xl border border-[#DCE0D4] bg-[#F1F3EE] p-7 md:col-span-2 md:min-h-56 sm:p-8">
            <Flame aria-hidden="true" className="size-8 text-[#536431]" strokeWidth={1.8} />
            <div className="mt-auto pt-8">
              <h3 className="text-xl font-semibold tracking-[-0.03em]">Kendali pembakaran</h3>
              <p className="mt-2 max-w-[45ch] text-sm leading-relaxed text-[#4F5949]">Bagian pembakaran mendukung proses pengukusan dan pemantauannya.</p>
            </div>
          </article>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-[#4F5949]">
          Gambaran fungsi komponen; model sensor dan rincian rangkaian menunggu dokumentasi final.
        </p>
      </div>
    </section>
  );
}
