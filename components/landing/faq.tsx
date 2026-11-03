const questions = [
  {
    question: "SASSY digunakan untuk apa?",
    answer: "SASSY adalah alat pengukusan kain dan kulit. Selama proses berlangsung, suhu, level air, dan pembakaran menjadi bagian dari kondisi yang dipantau.",
  },
  {
    question: "Bagaimana data dari alat ditampilkan?",
    answer: "ESP32-S3 mengirim telemetri langsung ke Supabase melalui HTTP. Dashboard admin menampilkan data proses untuk ditinjau.",
  },
  {
    question: "Apakah semua pengunjung bisa masuk ke dashboard?",
    answer: "Tidak. Landing page terbuka untuk umum, sedangkan dashboard hanya untuk admin yang memiliki akun.",
  },
  {
    question: "Apakah skema elektronika sudah final?",
    answer: "Belum. Skema pada halaman ini hanya menjelaskan alur konseptual, bukan sambungan pin atau panduan wiring. Rincian rangkaian menunggu dokumentasi final.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8 md:pb-32 lg:px-12">
      <div className="grid gap-10 border-t border-[#DCE0D4] pt-16 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-20 md:pt-24">
        <div>
          <h2 id="faq-title" className="max-w-[460px] text-[clamp(2.25rem,4.3vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.05em]">
            Pertanyaan yang sering <span className="text-[#6E8143]">muncul.</span>
          </h2>
          <p className="mt-5 max-w-[40ch] text-base leading-[1.8] text-[#4F5949] sm:text-lg">
            Kenali fungsi alat, alur data, dan akses ke pemantauan SASSY.
          </p>
        </div>

        <div className="border-t border-[#DCE0D4]">
          {questions.map(({ question, answer }) => (
            <details key={question} className="group border-b border-[#DCE0D4]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-base font-semibold leading-snug text-[#2B3024] transition-colors hover:text-[#536431] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#536431] sm:py-7 sm:text-lg [&::-webkit-details-marker]:hidden">
                {question}
                <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#DCE0D4] text-xl font-normal leading-none text-[#536431] transition-transform duration-300 ease-out group-open:rotate-45 motion-reduce:transition-none">+</span>
              </summary>
              <p className="max-w-[58ch] pb-7 pr-12 text-sm leading-[1.8] text-[#4F5949] sm:text-base">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
