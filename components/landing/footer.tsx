import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "#perangkat", label: "Perangkat" },
  { href: "#tentang", label: "Tentang" },
  { href: "#skema", label: "Skema" },
  { href: "#komponen", label: "Komponen" },
  { href: "#faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="bg-[#3B472D] text-[#F8F9F5]">
      <div className="mx-auto max-w-[1400px] px-5 pt-16 pb-8 sm:px-8 md:pt-20 lg:px-12">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:gap-16">
          <div className="max-w-[440px]">
            <Link href="/" className="inline-block text-2xl font-extrabold tracking-[-0.05em] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F8F9F5]">
              SASSY<span className="text-[#B8CB92]">.</span>
            </Link>
            <p className="mt-6 text-base leading-relaxed text-[#E4EBD9]">
              Sistem pengukusan kain dan kulit dengan pemantauan suhu, level air, dan pembakaran.
            </p>
            <a href="https://www.instagram.com/arise.sassy/" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#82916C] px-4 py-2.5 text-sm text-[#F8F9F5] transition-colors hover:border-[#B8CB92] hover:bg-[#536431] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F8F9F5]">
              <Image src="/images/instagram.svg" alt="" width={20} height={20} />
              @arise.sassy
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Institusi</h2>
            <address className="mt-6 text-base leading-relaxed not-italic text-[#E4EBD9]">
              Sekolah Vokasi<br />
              IPB University<br />
              Bogor, Jawa Barat, Indonesia
            </address>
          </div>

          <nav aria-label="Navigasi footer" className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-sm font-semibold">Jelajahi</h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-base sm:max-w-[300px]">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-[#E4EBD9] underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8F9F5]">
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/login" className="text-[#E4EBD9] underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8F9F5]">
                  Masuk Admin
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-16 border-t border-[#82916C]/60 pt-6 text-sm text-[#E4EBD9] md:mt-20">
          © 2026 SASSY. Seluruh hak dilindungi.
        </div>
      </div>
    </footer>
  );
}
