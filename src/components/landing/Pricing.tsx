const freeTier = [
  "10 chat selama masa gratis (Sahabat saja)",
  "Mood tracker harian (Tanpa Grafik)",
  "Tugas harian dasar (1 Micro-Quest/hari)",
  "Coba 1x Tes Kesehatan Mental (Calm Check)",
  "Coba 1x Emergency Calm Mode & Pernapasan SOS",
  "Jurnal manual (Maks 2 entri)",
  "Gratitude journal (Maks 2 entri)",
  "Coba 1x Analisis Emotional Eating",
];

const monthlyFeatures = [
  "🎯 Tugas Harian Pemulihan (3-Min Daily Quest)",
  "🫁 Emergency Calm Mode & Pernapasan SOS Tanpa Batas",
  "💬 Curhat tanpa batas & semua Pendamping AI",
  "📋 Tes Kesehatan Mental (Calm Check) & Skor",
  "📓 Jurnal Refleksi CBT & Gratitude tanpa batas",
  "📈 Growth Dashboard & Grafik Emosi Lengkap",
  "🍎 Emotional Eating Analysis & Craving Tracker",
  "🤝 Akses Komunitas Aman & Fitur Pelukan 🩵",
  "📒 Ekspor PDF Diary Bergaya Buku Harian",
];

const quarterlyFeatures = [
  "🎯 Roadmap Tugas Harian Pemulihan 90 Hari (CBT)",
  "🫁 Emergency Calm Mode & Pernapasan SOS Tanpa Batas",
  "💬 Curhat tanpa batas & semua Pendamping AI",
  "📋 Tes Kesehatan Mental (Calm Check) & Tren 90 Hari",
  "📓 Jurnal Refleksi CBT & Gratitude tanpa batas",
  "📈 Growth Dashboard & Evaluasi Grafik 3 Bulan",
  "🍎 Emotional Eating Analysis & Craving Interrupter",
  "📄 Laporan Ringkasan Klinis Siap Cetak (PDF)",
  "🔒 Riwayat Penuh 90 Hari Tersimpan Aman",
  "🤝 Akses Komunitas Aman & Fitur Pelukan 🩵",
];

const annualFeatures = [
  "🎯 Roadmap & Quest Pemulihan Personal 365 Hari",
  "🫁 Emergency Calm Mode & Pernapasan SOS Tanpa Batas",
  "👑 Semua Fitur Lengkap Program Pemulihan 90 Hari",
  "🔒 Riwayat Penuh 1 TAHUN Tersimpan Aman",
  "📄 Ekspor PDF Diary & Kilas Balik Tahunan",
  "⭐ Akses Pertama Fitur & Pendamping AI Baru",
  "⚡ Dukungan & Respons Prioritas Utama",
  "💰 Hemat Rp98.000 vs bayar per bulan",
];

const FAQ = [
  {
    q: "Apa saja yang ada dalam Emergency Calm Mode?",
    a: "Emergency Calm Mode adalah fitur intervensi krisis instan saat kamu merasa panik atau cemas hebat. Berisi latihan pernapasan terpandu (4-7-8, Box Breathing), audio penenang, serta kontak bantuan darurat. Semua paket program pemulihan (1 Bulan, 3 Bulan, 1 Tahun) mendapatkan AKSES TANPA BATAS untuk fitur ini.",
  },
  {
    q: "Apa saja seluruh fitur yang saya dapatkan dalam Program Pemulihan Bloom Mind?",
    a: "Kamu mendapatkan akses penuh ke 10+ fitur klinis holistik: Emergency Calm Mode & Pernapasan SOS Tanpa Batas, JN-CALM Chat (Curhat AI), CBT Reflective Journaling, Gratitude Journal, Mood Weather Tracker, Calm Check Mental Screening, Emotional Eating Interrupter, Growth Dashboard Analytics, Komunitas Aman (Sahabat Support), dan Ekspor PDF Diary.",
  },
  {
    q: "Apa itu Tugas Harian Pemulihan (Daily Quest)?",
    a: "Tugas Harian Pemulihan adalah aktivitas mikro berdurasi 2–3 menit setiap hari yang dirancang berbasis teknik terapi psikologi (CBT & Mindfulness). Mulai dari jurnal refleksi singkat, latihan pernapasan terpandu, hingga teknik mengurai cemas.",
  },
  {
    q: "Apakah data saya aman dan terenkripsi?",
    a: "Ya. Semua data dienkripsi dan tidak pernah dibagikan ke pihak ketiga. Privasi kamu adalah prioritas utama kami.",
  },
  {
    q: "Berapa lama riwayat saya disimpan?",
    a: "Paket Reset 30 Hari & 90 Hari menyimpan riwayat chat, mood, dan jurnal syukur selama masa aktif dan 3 bulan terakhir. Paket Tahunan menyimpan seluruh riwayat hingga 1 tahun penuh. Data yang lebih lama bisa kamu unduh sebagai PDF Diary bergaya buku harian sebelum dihapus.",
  },
  {
    q: "Kenapa Program 90 Hari (3 Bulan) direkomendasikan untuk pemulihan?",
    a: "Berdasarkan riset psikologi perilaku, otak manusia membutuhkan waktu rata-rata 60 hingga 90 hari untuk mengurai kebiasaan emosional lama (seperti impuls kecemasan atau emotional eating) dan membentuk regulasi emosi baru yang stabil.",
  },
  {
    q: "Bisakah saya mengunduh data saya?",
    a: "Tentu! Kamu bisa mengekspor seluruh riwayat chat, mood, dan jurnal syukur ke format PDF Diary bergaya buku harian — lengkap dengan tanggal, emoji, dan tata letak yang rapi, siap dicetak atau disimpan sebagai kenangan.",
  },
  {
    q: "Bagaimana cara pembayaran?",
    a: "Pembayaran dapat dilakukan secara instan & otomatis menggunakan Kartu Kredit, E-Wallet (GoPay, OVO, ShopeePay, Dana), QRIS, atau Virtual Account melalui payment gateway Mayar.id.",
  },
];

function CheckIcon({ premium, accent }: { premium?: boolean; accent?: string }) {
  return (
    <span
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
        accent ? accent : premium ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"
      }`}
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Program Pemulihan Emosi Complete</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
            Investasi Terkecil untuk Kedamaian Pikiranmu
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Akses penuh & tanpa batas ke Emergency Calm Mode serta 10+ fitur klinis psikologi holistik.
          </p>
        </div>

        {/* Plan cards — 4 columns layout */}
        <div data-reveal className="mx-auto mt-14 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">

          {/* Free Tier */}
          <div className="rounded-3xl bg-card p-7 ring-1 ring-border flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gratis</p>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  🌱 COBA
                </span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-foreground">Uji Coba Awal</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-sans text-4xl font-bold text-foreground">Rp0</span>
                <span className="text-xs text-muted-foreground">/bulan</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">Mulai tanpa perlu kartu kredit.</p>
              
              <ul className="mt-6 space-y-2.5">
                {freeTier.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-foreground">
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <a
                href="/auth?mode=register"
                className="block rounded-full border border-border py-3.5 text-center text-xs font-semibold text-foreground transition-colors hover:bg-cream-deep"
              >
                Mulai Gratis
              </a>
            </div>
          </div>

          {/* 1 Bulan: Program Reset 30 Hari */}
          <div className="relative flex flex-col h-full">
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-teal-400 via-cyan-500 to-teal-600 opacity-25 blur-md" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card p-7 ring-1 ring-border flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">1 Bulan</p>
                  <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold text-teal-700">
                    🌿 RESET 30 HARI
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-foreground">Program Reset</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-sans text-4xl font-bold text-foreground">Rp49.000</span>
                  <span className="text-xs text-muted-foreground">/bulan</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">Emergency Calm Mode tanpa batas + tugas harian 3 menit.</p>

                <ul className="mt-6 space-y-2.5">
                  {monthlyFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-foreground">
                      <CheckIcon accent="bg-teal-600 text-white" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="/auth?mode=register"
                  className="block rounded-full bg-teal-600 py-3.5 text-center text-xs font-bold text-white shadow-md transition-all duration-300 hover:bg-teal-700"
                >
                  Mulai Program Reset 30 Hari
                </a>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  ☕ Cuma Rp1.600-an/hari 🌱
                </p>
              </div>
            </div>
          </div>

          {/* 3 Bulan: Program Pemulihan Utuh 90 Hari (FEATURED / HIGHLIGHTED) */}
          <div className="relative flex flex-col h-full lg:-translate-y-3">
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 opacity-60 blur-lg" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-card p-7 ring-2 ring-amber-500 flex flex-col justify-between h-full shadow-2xl">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">3 Bulan (90 Hari)</p>
                  <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                    🔥 REKOMENDASI HEALING
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-foreground">Pemulihan Utuh</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-sans text-4xl font-bold text-foreground">Rp119.000</span>
                  <span className="text-xs text-muted-foreground">/3 bulan</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground line-through">Rp147.000</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Hemat 20%</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">Emergency Calm Mode tanpa batas + roadmap 90 hari.</p>

                <ul className="mt-6 space-y-2.5">
                  {quarterlyFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-xs font-medium text-foreground">
                      <CheckIcon accent="bg-amber-500 text-white" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="/auth?mode=register"
                  className="block rounded-full bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-center text-xs font-black text-white shadow-lg transition-all duration-300 hover:opacity-95 hover:shadow-xl"
                >
                  Mulai Program Pemulihan 90 Hari
                </a>
                <p className="mt-2 text-center text-[10px] font-semibold text-amber-700">
                  🎯 Cuma Rp1.300-an/hari (Setara Rp39.600/bln)
                </p>
              </div>
            </div>
          </div>

          {/* 1 Tahun: Program Pendampingan Utuh */}
          <div className="relative flex flex-col h-full">
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-500 opacity-30 blur-md" />
            <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-50/60 to-indigo-50/60 dark:from-violet-950/20 dark:to-indigo-950/20 p-7 ring-1 ring-violet-300 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">1 Tahun (365 Hari)</p>
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">
                    🏆 TRANSFORMASI UTUH
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-foreground">Pendampingan Utuh</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-sans text-4xl font-bold text-foreground">Rp490.000</span>
                  <span className="text-xs text-muted-foreground">/tahun</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground line-through">Rp588.000</span>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">Hemat 17%</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">Emergency Calm Mode tanpa batas + pendampingan 365 hari.</p>

                <ul className="mt-6 space-y-2.5">
                  {annualFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-foreground">
                      <CheckIcon accent="bg-violet-600 text-white" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href="/auth?mode=register"
                  className="block rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-center text-xs font-bold text-white shadow-md transition-all duration-300 hover:opacity-95"
                >
                  Ambil Akses 1 Tahun
                </a>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  💜 Cuma Rp1.300-an/hari (Paling Hemat) 🏆
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Reassurance strip */}
        <div data-reveal className="mx-auto mt-12 max-w-5xl">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">🔒 Data terenkripsi & pribadi</span>
            <span className="flex items-center gap-1.5">📒 Ekspor PDF Diary bergaya buku harian</span>
            <span className="flex items-center gap-1.5">✨ Bebas berhenti perpanjangan kapan saja</span>
            <span className="flex items-center gap-1.5">💳 Bayar via GoPay, OVO, QRIS & Kartu</span>
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
