"use client";

import { useEffect, useRef, useState } from "react";
import { CircuitBoard, Cpu, Database, Monitor, Server, X } from "lucide-react";
import { Popover } from "radix-ui";

const blocks = [
  { name: "Sensor dan aktuator", icon: CircuitBoard, caption: "Pembacaan & kendali", detail: "Sensor membaca suhu dan level air. Aktuator menjalankan kendali perangkat sesuai perintah ESP32-S3.", input: "Perintah kendali dari ESP32-S3", output: "Pembacaan kondisi alat", position: "md:col-start-1 md:row-start-1" },
  { name: "ESP32-S3", icon: Cpu, caption: "Pengendali perangkat", detail: "Mengolah pembacaan sensor dan menjalankan kendali PID. Telemetri dikirim langsung ke Supabase, bukan melalui FastAPI.", input: "Sensor dan PID berstatus active melalui polling HTTP pada awal sesi", output: "Telemetri melalui HTTPS dan perintah aktuator", position: "md:col-start-2 md:row-start-1" },
  { name: "Database", icon: Database, caption: "Supabase", detail: "Menyimpan telemetri dan parameter PID. Realtime mengirim perubahan telemetry dan pid_parameters ke dashboard.", input: "Telemetri, hasil optimasi, dan persetujuan admin", output: "Data pemantauan, data training, dan PID aktif", position: "md:col-start-3 md:row-start-1" },
  { name: "Web Dashboard", icon: Monitor, caption: "Pemantauan admin", detail: "Admin memantau proses, memicu training, dan membandingkan parameter. Persetujuan admin mengubah PID pending_review menjadi active.", input: "Data Supabase melalui HTTPS dan pembaruan melalui WSS", output: "Permintaan training dan persetujuan PID melalui HTTPS", position: "md:col-start-2 md:row-start-2" },
  { name: "FastAPI Server", icon: Server, caption: "Training & optimasi", detail: "Backend di Render melatih model dan mencari parameter PID optimal. Hasil disimpan ke Supabase dengan status pending_review, menunggu persetujuan admin.", input: "Pemicu HTTPS dari web server dan data training Supabase", output: "Parameter PID pending_review melalui HTTPS REST", position: "md:col-start-3 md:row-start-2" },
];

const connections = [
  { from: 0, to: 1, both: true },
  { from: 1, to: 2, both: true },
  { from: 2, to: 3, both: true },
  { from: 3, to: 4, both: false },
  { from: 4, to: 2, both: true },
];

export function ElectronicsFlow() {
  const container = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => {
      const box = element.getBoundingClientRect();
      const mobile = window.innerWidth < 768;
      setMobile(mobile);
      setPaths(connections.map(({ from, to }) => {
        const a = nodes.current[from]!.getBoundingClientRect();
        const b = nodes.current[to]!.getBoundingClientRect();
        const x1 = a.left - box.left + a.width / 2;
        const y1 = a.top - box.top + a.height / 2;
        const x2 = b.left - box.left + b.width / 2;
        const y2 = b.top - box.top + b.height / 2;
        if (Math.abs(to - from) > 1) {
          const startY = a.bottom - box.top;
          const endY = b.bottom - box.top;
          const bendY = Math.max(startY, endY) + 80;
          return `M ${x1} ${startY} C ${x1} ${bendY}, ${x2} ${bendY}, ${x2} ${endY}`;
        }
        return `M ${a.right - box.left} ${y1} L ${b.left - box.left} ${y2}`;
      }));
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    nodes.current.forEach((node) => node && resize.observe(node));
    const intersection = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    intersection.observe(element);
    window.addEventListener("resize", measure);
    return () => { resize.disconnect(); intersection.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  return (
    <>
      <section id="skema" aria-labelledby="skema-title" className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8 md:pb-32 lg:px-12">
        <div className="border-t border-[#DCE0D4] pt-16 md:pt-24">
          <h2 id="skema-title" className="max-w-[800px] text-[clamp(2.25rem,4.3vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.05em]">Arsitektur sistem.<br /><span className="text-[#6E8143]">Satu alur terhubung.</span></h2>
          <p className="mt-5 max-w-[58ch] text-base leading-[1.8] text-[#4F5949] sm:text-lg">Dari pembacaan sensor hingga optimasi PID. Pilih blok untuk mengenali perannya dalam sistem SASSY.</p>
          <figure className="mt-12 rounded-2xl border border-[#DCE0D4] bg-[#EEF1E9] p-3 sm:p-8 md:mt-16">
            <div role="region" aria-label="Diagram arsitektur sistem, geser horizontal untuk melihat semua blok" tabIndex={0} className="overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#536431]">
            <div ref={container} data-architecture data-visible={visible} className="relative grid min-w-[960px] grid-cols-5 items-center gap-x-14 px-4 pt-8 pb-28">
              <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                {paths.map((path, index) => <g key={index}>
                  <path d={path} fill="none" stroke="#C5CEB7" strokeWidth="1.5" />
                  <path className="architecture-pulse" d={path} pathLength="100" fill="none" stroke="#6E8143" strokeWidth="3" strokeDasharray="9 91" style={{ animationDelay: `${index * -0.7}s` }} />
                  {connections[index].both && <path className="architecture-pulse architecture-reverse" d={path} pathLength="100" fill="none" stroke="#899B65" strokeWidth="2" strokeDasharray="7 93" style={{ animationDelay: `${index * -0.9}s` }} />}
                </g>)}
              </svg>
              {blocks.map((block, index) => <Popover.Root key={block.name} open={active === index} onOpenChange={(open) => setActive(open ? index : null)} modal={false}>
                <Popover.Trigger asChild>
                  <button ref={(node) => { nodes.current[index] = node; }} type="button" aria-label={`Keterangan ${block.name}`} className={`relative z-20 flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border px-3 py-5 text-center transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#536431] ${active === index ? "border-[#536431] bg-[#536431] text-[#F8F9F5]" : "border-[#CED5C3] bg-[#F8F9F5] text-[#283222] hover:border-[#6E8143] hover:bg-[#E4EAD9]"}`}>
                    <block.icon aria-hidden="true" className="size-7" strokeWidth={1.5} />
                    <span className="text-sm font-semibold sm:text-base">{block.name}</span>
                    <span className="text-xs opacity-80">{block.caption}</span>
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content side={mobile ? "bottom" : index >= 3 ? "left" : "right"} sideOffset={16} collisionPadding={20} onOpenAutoFocus={(event) => event.preventDefault()} className="architecture-popover z-50 w-[340px] max-w-[calc(100vw-40px)] rounded-xl border border-[#CED5C3] bg-[#F8F9F5] p-6 text-[#283222] shadow-[0_16px_48px_-16px_rgba(40,50,34,0.3)] outline-none">
                    <Popover.Close aria-label="Tutup keterangan" className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full hover:bg-[#E4EAD9] focus-visible:outline-2 focus-visible:outline-[#536431]"><X aria-hidden="true" className="size-4" /></Popover.Close>
                    <h3 className="pr-7 text-lg font-semibold tracking-tight">{block.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#4F5949]">{block.detail}</p>
                    <dl className="mt-5 space-y-3 border-t border-[#DCE0D4] pt-4 text-xs leading-5"><div><dt className="font-semibold text-[#536431]">Data masuk</dt><dd>{block.input}</dd></div><div><dt className="font-semibold text-[#536431]">Data keluar</dt><dd>{block.output}</dd></div></dl>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>)}
            </div>
            </div>
            <figcaption className="mt-5 border-t border-[#DCE0D4] pt-5 text-xs leading-6 text-[#4F5949]">Pulsa menggambarkan komunikasi, bukan status koneksi aktual. Pilih blok untuk detail protokol dan data. Diagram ini bukan diagram rangkaian atau panduan wiring.</figcaption>
          </figure>
        </div>
      </section>
      <section id="skematik" aria-labelledby="skematik-title" className="mx-auto max-w-[1400px] px-5 pb-24 sm:px-8 md:pb-32 lg:px-12">
        <div className="border-t border-[#DCE0D4] pt-16">
          <h2 id="skematik-title" className="text-[clamp(2rem,3.5vw,3.5rem)] font-semibold leading-tight tracking-[-0.05em]">Skematik perangkat</h2>
          <div className="mt-8 flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#C5CEB7] px-6 py-12 text-center">
            <CircuitBoard aria-hidden="true" className="size-9 text-[#6E8143]" strokeWidth={1.25} />
            <p className="text-base font-medium text-[#4F5949]">Skematik lengkap sedang disiapkan.</p>
            <p className="max-w-[44ch] text-sm leading-6 text-[#4F5949]">Gambar rangkaian dan detail sambungan perangkat akan ditampilkan di sini setelah dokumentasi tersedia.</p>
          </div>
        </div>
      </section>
      <style>{`
        @keyframes architecture-dash { to { stroke-dashoffset: -100; } }
        .architecture-pulse { animation: architecture-dash 3.5s linear infinite; animation-play-state: paused; }
        .architecture-reverse { animation-direction: reverse; }
        [data-visible="true"] .architecture-pulse { animation-play-state: running; }
        @media (prefers-reduced-motion: reduce) { .architecture-pulse { animation: none; } }
        @media (max-width: 767px) { .architecture-popover { max-height: 45dvh; overflow-y: auto; } }
      `}</style>
    </>
  );
}
