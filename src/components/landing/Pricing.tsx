const freeTier = [
  "10 chat selama masa gratis (Sahabat saja)",
  "Mood tracker harian (Tanpa Grafik)",
  "Coba 1x Tes Kesehatan Mental (Calm Check)",
  "Jurnal manual (Maks 2 entri)",
  "Habit tracker (Maks 1 Habit)",
  "Gratitude journal (Maks 2 entri)",
  "Coba 1x Analisis Emotional Eating",
];

const premiumMonthlyFeatures = [
  "Curhat tanpa batas & semua Pendamping",
  "Tes Kesehatan Mental (Calm Check) & Riwayat Skor",
  "Jurnal & Gratitude tanpa batas",
  "Growth Dashboard & Grafik Lengkap",
  "Refleksi Harian & Mingguan",
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

        {/* Plan cards — 4 columns */}
        <div data-reveal className="mx-auto mt-14 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">

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

          {/* Premium Weekly */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 opacity-20 blur-lg" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card p-7 ring-1 ring-border flex flex-col h-full">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-soft opacity-40 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Premium</p>
                  <span className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    🌱 COBA DULU
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-sans text-4xl font-bold text-foreground">Rp15.000</span>
                  <span className="text-muted-foreground">/minggu</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Pilihan praktis untuk mencoba seluruh fitur premium.</p>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {premiumMonthlyFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckIcon premium />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/auth?mode=register"
                className="relative mt-7 block rounded-full bg-emerald-600 py-3.5 px-4 text-center text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
              >
                Mulai Tenangkan Pikiran (Rp15rb)
              </a>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                ☕ Cuma Rp2.100-an/hari — Cocok untuk uji coba 🌱
              </p>
            </div>
          </div>

          {/* Premium Monthly */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-primary via-accent to-primary opacity-50 blur-lg" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card p-7 ring-2 ring-primary/60 flex flex-col h-full shadow-xl">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary-soft opacity-70 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Premium</p>
                  <span className="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 text-xs font-bold text-amber-700 shadow-xs">
                    🔥 PALING POPULER
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-sans text-4xl font-bold text-foreground">Rp49.000</span>
                  <span className="text-muted-foreground">/bulan</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Langkah kecil untuk kedamaian pikiranmu.</p>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {premiumMonthlyFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckIcon premium />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/auth?mode=register"
                className="relative mt-7 block rounded-full bg-primary py-4 px-4 text-center text-sm font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:opacity-95"
              >
                Dapatkan Akses Curhat Bebas
              </a>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                ☕ Cuma Rp1.600-an/hari — <strong>Lebih hemat 24% vs Mingguan!</strong> 🔥
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

              <ul className="mt-6 flex-1 space-y-2.5">
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
                className="relative mt-7 block rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 px-4 text-center text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-violet-300/50 hover:shadow-xl"
              >
                Ambil Akses 1 Tahun (Hemat 37%)
              </a>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                💜 Cuma Rp1.300-an/hari — <strong>Paling hemat!</strong> 🏆
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
