const freeTier = [
  "3 sesi chat AI / hari (Sahabat saja)",
  "Mood tracker harian (Tanpa Grafik)",
  "Jurnal manual (Maks 2 entri)",
  "Habit tracker (Maks 1 Habit)",
  "Gratitude journal (Maks 2 entri)",
  "Coba 1x Analisis Emotional Eating",
];

const premiumMonthlyFeatures = [
  "Chat AI tanpa batas & semua Companion",
  "Jurnal & Gratitude tanpa batas",
  "Growth Dashboard & Grafik Lengkap",
  "Daily & Weekly AI Insight personal",
  "Emotional Eating Analysis",
  "Riwayat 3 bulan terakhir tersimpan",
  "Ekspor PDF Diary bergaya buku harian",
  "Habit tracker tanpa batas",
];

const premiumAnnualFeatures = [
  "Semua fitur Premium Bulanan",
  "Riwayat penuh 1 TAHUN tersimpan aman",
  "Ekspor PDF Diary bergaya buku harian",
  "Hemat Rp98.000 vs bayar per bulan",
  "Prioritas akses fitur baru",
  "Dukungan & respons lebih cepat",
];

const FAQ = [
  {
    q: "Apakah data saya aman?",
    a: "Ya. Semua data dienkripsi dan tidak pernah dibagikan ke pihak ketiga. Privasi kamu adalah prioritas kami.",
  },
  {
    q: "Berapa lama riwayat saya disimpan?",
    a: "Paket Bulanan menyimpan riwayat chat, mood, dan jurnal syukur selama 3 bulan terakhir. Paket Tahunan menyimpan seluruh riwayat hingga 1 tahun penuh. Data yang lebih lama bisa kamu unduh sebagai PDF Diary bergaya buku harian atau JSON sebelum dihapus — tidak ada yang hilang tanpa peringatan.",
  },
  {
    q: "Bisakah saya mengunduh data saya?",
    a: "Tentu! Kamu bisa mengekspor seluruh riwayat chat, mood, dan jurnal syukur ke format PDF Diary bergaya buku harian — lengkap dengan tanggal, emoji, dan tata letak yang rapi, siap dicetak atau disimpan sebagai kenangan. Tersedia juga format JSON untuk arsip digital.",
  },
  {
    q: "Bisakah saya berhenti berlangganan kapan saja?",
    a: "Tentu! Kamu bebas menghentikan perpanjangan langganan untuk periode berikutnya kapan saja. Pembayaran yang sudah berjalan bersifat final (tidak dapat di-refund), tetapi akses Premium kamu akan tetap aktif sepenuhnya hingga masa berlaku paket tersebut selesai.",
  },
  {
    q: "Bagaimana cara pembayaran?",
    a: "Pembayaran dapat dilakukan secara instan & otomatis menggunakan Kartu Kredit, E-Wallet (GoPay, OVO, ShopeePay, Dana), QRIS, atau Virtual Account melalui payment gateway Mayar.id.",
  },
  {
    q: "Bagaimana JN-CALM mendampingi keseharian saya?",
    a: "JN-CALM dirancang sebagai ruang aman interaktif untuk membantumu meluangkan waktu sejenak, merefleksikan emosi harian, melacak kebiasaan baik, dan mendapatkan tanggapan hangat saat ingin curhat. Ini adalah teman harian yang sangat baik untuk melatih kesadaran diri (self-awareness) dan menjaga kesehatan mentalmu. Untuk penanganan medis atau terapi klinis mendalam, kamu juga tetap disarankan berkonsultasi dengan profesional berlisensi.",
  },
];

function CheckIcon({ premium }: { premium?: boolean }) {
  return (
    <span
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${premium ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="h-3 w-3"
        aria-hidden="true"
      >
        <path d="m5 12 4 4 10-10" />
      </svg>
    </span>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl bg-card ring-1 ring-border transition-all duration-200 hover:shadow-card">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-foreground list-none">
        {q}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-4 w-4 shrink-0 transition-transform duration-300 group-open:rotate-180 text-muted-foreground"
          aria-hidden="true"
        >
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
            Investasi Terkecil untuk Kesehatan Mentalmu
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Lebih murah dari satu sesi konsultasi — dan kamu bisa pakai setiap hari.
          </p>
        </div>

        {/* Plan cards — 3 columns */}
        <div data-reveal className="mx-auto mt-14 grid max-w-5xl gap-5 lg:grid-cols-3">

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
                  <CheckIcon />
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

          {/* Premium Monthly */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-accent via-primary to-accent opacity-40 blur-lg" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card p-7 ring-1 ring-border flex flex-col h-full">
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
                <p className="mt-2 text-sm text-muted-foreground">Bisa berhenti kapan saja.</p>
              </div>

              {/* Storage info badge */}
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-200/60">
                <span className="text-base leading-none mt-0.5">📒</span>
                <p className="text-xs text-amber-800 leading-snug">
                  <span className="font-semibold">Riwayat disimpan 3 bulan.</span> Data lebih lama bisa diekspor sebagai <strong>PDF Diary bergaya buku harian</strong> yang cantik & siap cetak, kapan saja sebelum dihapus.
                </p>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {premiumMonthlyFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckIcon premium />
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

          {/* Annual */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-500 opacity-50 blur-lg" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-50 to-indigo-50 p-7 ring-1 ring-violet-200 flex flex-col h-full">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-200 opacity-40 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Premium Tahunan</p>
                  <span className="rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 px-3 py-1 text-xs font-bold text-violet-700">
                    🏆 TERBAIK
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-sans text-4xl font-bold text-foreground">Rp490.000</span>
                  <span className="text-muted-foreground">/tahun</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground line-through">Rp588.000</span>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">Hemat 17%</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Sekali bayar, tenang setahun penuh.</p>
              </div>

              {/* Storage info badge */}
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-violet-50 px-3 py-2.5 ring-1 ring-violet-200/80">
                <span className="text-base leading-none mt-0.5">📖</span>
                <p className="text-xs text-violet-800 leading-snug">
                  <span className="font-semibold">Riwayat disimpan 1 TAHUN PENUH.</span> Ekspor kapan saja sebagai <strong>PDF Diary bergaya buku harian</strong> — kenangan indahmu tersimpan rapi & bisa dicetak seumur hidup.
                </p>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {premiumAnnualFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-600 text-white">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <path d="m5 12 4 4 10-10" />
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/auth?mode=register"
                className="relative mt-7 block rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-center text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-violet-300/50 hover:shadow-xl"
              >
                Mulai Perjalanan 1 Tahun
              </a>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                💜 Setara Rp40.800/bulan — investasi terbaik untuk dirimu
              </p>
            </div>
          </div>

        </div>

        {/* Reassurance strip */}
        <div data-reveal className="mx-auto mt-10 max-w-5xl">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">🔒 Data terenkripsi & pribadi</span>
            <span className="flex items-center gap-1.5">📒 Ekspor PDF Diary bergaya buku harian</span>
            <span className="flex items-center gap-1.5">✨ Bebas berhenti kapan saja</span>
            <span className="flex items-center gap-1.5">💳 Bayar via GoPay, OVO, QRIS & kartu</span>
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
