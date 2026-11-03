import { OriginButton } from "@/components/ui/origin-button";

export function BottomCta() {
  return (
    <section aria-labelledby="bottom-cta-title" className="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8 md:pb-24 lg:px-12">
      <div className="grid gap-8 rounded-2xl bg-[#E8EEE0] px-6 py-10 sm:px-10 md:grid-cols-[1fr_auto] md:items-end md:gap-12 md:px-14 md:py-14">
        <div>
          <h2 id="bottom-cta-title" className="max-w-[680px] text-[clamp(2rem,4vw,3.75rem)] font-semibold leading-[1.1] tracking-[-0.05em]">
            Akses pemantauan SASSY.
          </h2>
          <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-[#4F5949]">
            Dashboard tersedia khusus bagi admin yang memiliki akun.
          </p>
        </div>
        <OriginButton href="/login" className="w-fit shrink-0">Masuk Admin</OriginButton>
      </div>
    </section>
  );
}
