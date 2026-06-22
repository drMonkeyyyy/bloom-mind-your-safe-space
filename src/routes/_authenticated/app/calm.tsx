import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/app/calm")({
  component: Page,
});

function Page() {
  const [tool, setTool] = useState<"breath"|"ground"|"selftalk"|null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Emergency Calm Mode</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tarik napas. Kamu aman di sini.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { k:"breath" as const, icon:"🌬️", title:"Breathing 4-7-8", desc:"Latihan napas singkat." },
          { k:"ground" as const, icon:"🌍", title:"Grounding 5-4-3-2-1", desc:"Kembali ke saat ini." },
          { k:"selftalk" as const, icon:"🤍", title:"Self-Calming Talk", desc:"Kalimat menenangkan." },
        ].map((t)=>(
          <button key={t.k} onClick={()=>setTool(t.k)} className="rounded-3xl bg-card p-5 text-left ring-1 ring-border hover:-translate-y-0.5 transition">
            <p className="text-2xl">{t.icon}</p>
            <h3 className="mt-2 font-display text-lg font-semibold">{t.title}</h3>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </button>
        ))}
        <a href="tel:119" className="rounded-3xl bg-accent p-5 text-left text-accent-foreground shadow-peach">
          <p className="text-2xl">📞</p>
          <h3 className="mt-2 font-display text-lg font-semibold">Hubungi orang terdekat</h3>
          <p className="text-xs opacity-90">Atau telpon 119 (Sehat Jiwa).</p>
        </a>
      </div>

      {tool === "breath" && (
        <section className="rounded-3xl bg-gradient-to-br from-primary-soft to-accent-soft p-8 text-center">
          <div className="relative mx-auto h-56 w-56 grid place-items-center">
            <div className="absolute inset-0 rounded-full bg-primary/15 animate-breathe" />
            <div className="absolute inset-6 rounded-full bg-primary/25 animate-breathe" style={{ animationDelay:"0.6s" }} />
            <div className="relative grid h-24 w-24 place-items-center rounded-full bg-primary text-primary-foreground">
              <p className="font-display text-xl">4·7·8</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Tarik napas 4 detik · Tahan 7 detik · Buang 8 detik. Ulangi 4–6 siklus.</p>
        </section>
      )}
      {tool === "ground" && (
        <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
          <p className="font-display text-xl font-semibold">Grounding 5-4-3-2-1</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><strong>5</strong> hal yang kamu lihat</li>
            <li><strong>4</strong> hal yang kamu sentuh</li>
            <li><strong>3</strong> hal yang kamu dengar</li>
            <li><strong>2</strong> hal yang kamu cium</li>
            <li><strong>1</strong> hal yang kamu rasakan/syukuri</li>
          </ul>
        </section>
      )}
      {tool === "selftalk" && (
        <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-2 text-sm">
          {[
            "Aku boleh merasa seperti ini. Perasaan ini tidak akan selamanya.",
            "Aku aman saat ini. Aku punya waktu untuk pelan-pelan.",
            "Aku tidak harus sempurna untuk berharga.",
            "Satu langkah kecil sudah cukup untuk hari ini.",
          ].map((s,i)=>(<p key={i} className="rounded-2xl bg-cream-deep px-4 py-3">🤍 {s}</p>))}
        </section>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Bloom Mind bukan pengganti layanan darurat. Jika dalam krisis, hubungi 119 ext. 8 atau orang terdekat.
      </p>
    </div>
  );
}
