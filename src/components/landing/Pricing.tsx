const freeTier = [
  "3 sesi chat AI / hari (Sahabat saja)",
  "Mood tracker harian (Tanpa Grafik)",
  "Jurnal manual (Maks 2 entri)",
  "Habit tracker (Maks 1 Habit)",
  "Gratitude journal (Maks 2 entri)",
];

const premiumFeatures = [
  "Chat AI tanpa batas & semua Companion",
  "Jurnal & Gratitude tanpa batas",
  "Growth Dashboard & Grafik Lengkap",
  "Weekly AI Insight personal",
  "Emotional Eating Analysis",
  "Riwayat penuh tanpa batas",
  "Habit tracker tanpa batas",
];

const FAQ = [
  { q: "Apakah data saya aman?", a: "Ya. Semua data dienkripsi dan tidak pernah dibagikan ke pihak ketiga. Privasi kamu adalah prioritas kami." },
  { q: "Apakah ada kontrak jangka panjang?", a: "Tidak. Kamu bisa berlangganan bulan demi bulan dan berhenti kapan saja tanpa penalti." },
  { q: "Bagaimana cara pembayaran?", a: "Pembayaran dapat dilakukan secara instan & otomatis menggunakan Kartu Kredit, E-Wallet (GoPay, OVO, ShopeePay, Dana), QRIS, atau Virtual Account melalui payment gateway Mayar.id." },
  { q: "Apakah JN-CALM bisa menggantikan psikolog?", a: "JN-CALM adalah pendamping AI, bukan pengganti profesional kesehatan mental. Untuk kondisi serius, kami sarankan menemui psikolog." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl bg-card ring-1 ring-border transition-all duration-200 hover:shadow-card">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-foreground list-none">
        {q}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 shrink-0 transition-transform duration-300 group-open:rotate-180 text-muted-foreground" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
    </details>
  );
}

export function Pricing() {
  return (
    <section id="harga" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Harga</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Mulai Bertumbuh Hari Ini
          </h2>
          <p className="mt-4 text-base text-muted-foreground">Pilih paket yang sesuai denganmu.</p>
        </div>

        {/* Plan cards */}
        <div data-reveal className="mx-auto mt-14 grid max-w-4xl gap-5 lg:grid-cols-2">
          {/* Free */}
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border flex flex-col">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gratis</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-sans text-4xl font-bold text-foreground">Rp0</span>
                <span className="text-muted-foreground">/bulan</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Mulai tanpa perlu kartu kredit.</p>
            </div>
            <ul className="mt-6 flex-1 space-y-2.5">
              {freeTier.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3 w-3" aria-hidden="true">
                      <path d="m5 12 4 4 10-10" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/auth?mode=register"
              className="mt-7 block rounded-full border border-border py-3.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-cream-deep"
            >
              Mulai Gratis
            </a>
          </div>

          {/* Premium */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-accent via-primary to-accent opacity-50 blur-lg" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card p-7 ring-1 ring-border flex flex-col">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-soft opacity-60 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Premium</p>
                  <span className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 text-xs font-bold text-amber-700">
                    ✨ PALING POPULER
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-sans text-4xl font-bold text-foreground">Rp49.000</span>
                  <span className="text-muted-foreground">/bulan</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Tanpa kontrak · Bisa berhenti kapan saja.</p>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3 w-3" aria-hidden="true">
                        <path d="m5 12 4 4 10-10" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/auth?mode=register"
                className="relative mt-7 block rounded-full bg-accent py-4 text-center text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
              >
                Mulai Sekarang
              </a>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                ☕ Kurang dari sekali nongkrong di coffee shop
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div data-reveal className="mx-auto mt-20 max-w-2xl">
          <h3 className="text-center font-display text-2xl font-semibold text-foreground">Pertanyaan Umum</h3>
          <div className="mt-6 space-y-3">
            {FAQ.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
