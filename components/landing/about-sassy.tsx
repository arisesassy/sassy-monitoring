import Image from "next/image";

export function AboutSassy() {
  return (
    <section id="tentang" aria-labelledby="tentang-title" className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 md:py-32 lg:px-12">
      <div className="grid items-center gap-12 border-t border-[#DCE0D4] pt-16 md:grid-cols-[1fr_0.9fr] md:gap-16 md:pt-24 lg:gap-24">
        <div className="max-w-[570px]">
          <p className="mb-8 text-xs font-semibold tracking-[0.16em] text-[#536431] uppercase">Tentang SASSY</p>
          <h2 id="tentang-title" className="text-[clamp(2.25rem,4.3vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.05em]">
            Satu alat. Proses yang bisa <span className="text-[#6E8143]">dipantau.</span>
          </h2>
          <p className="mt-7 max-w-[48ch] text-base leading-[1.8] text-[#4F5949] sm:text-lg">
            SASSY menggabungkan pengukusan kain dan kulit dengan pemantauan suhu, level air, serta pembakaran dalam satu proses.
          </p>
          <p className="mt-4 max-w-[48ch] text-base leading-[1.8] text-[#4F5949] sm:text-lg">
            Data dari alat dikirim ke dashboard admin, sehingga kondisi pengukusan dapat ditinjau selama proses berlangsung.
          </p>
        </div>

        <figure className="relative">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-[#DCE0D4] sm:aspect-[4/3] md:aspect-[4/5]">
            <Image
              src="/images/login-hero.webp"
              alt="Detail panel kendali pada visual sementara alat SASSY"
              fill
              sizes="(min-width: 1400px) 565px, (min-width: 768px) 42vw, 100vw"
              className="object-cover object-[95%_center]"
            />
          </div>
          <figcaption className="mt-4 text-xs leading-relaxed text-[#4F5949]">
            Detail panel kendali · visual perangkat sementara
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
