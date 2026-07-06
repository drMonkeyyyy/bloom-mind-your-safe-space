import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Syarat Layanan · JN-CALM" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 overflow-hidden rounded-xl bg-white shadow-soft flex items-center justify-center border border-border/50">
              <img src="/logo.png" alt="JN-CALM Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-xl font-bold tracking-widest text-[#6E8C71]">JN-CALM</span>
          </Link>
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground shadow-peach transition-all hover:-translate-y-0.5"
          >
            Daftar Gratis
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Syarat Layanan
          </h1>
          <p className="text-sm text-muted-foreground">Terakhir diperbarui: 6 Juli 2026</p>
          <hr className="border-border" />

          <div className="prose prose-stone max-w-none space-y-8 text-sm leading-relaxed text-stone-700">
            <p>
              Selamat datang di <strong>JN-CALM</strong> ("Aplikasi"). Layanan ini disediakan oleh JN-CALM sebagai ruang aman untuk membantu Anda mengelola kesejahteraan emosional, menulis jurnal, melacak kebiasaan, dan bertumbuh secara mandiri.
            </p>
            <p>
              Dengan mendaftar, mengakses, atau menggunakan Aplikasi, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui seluruh ketentuan di dalam Syarat Layanan ini. Jika Anda tidak menyetujui ketentuan ini, Anda tidak diperkenankan untuk menggunakan Aplikasi.
            </p>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">1. Batasan Layanan (PENTING)</h2>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-amber-900 text-xs">
                <strong>Pemberitahuan Kesehatan Mental & Krisis:</strong> JN-CALM adalah aplikasi refleksi diri mandiri berbasis kecerdasan buatan (AI). JN-CALM <strong>bukan merupakan layanan medis profesional kesehatan mental, bukan psikoterapi, dan bukan dokter medis</strong>. Pendamping AI kami dirancang untuk refleksi diri dan dukungan percakapan ringan, bukan pengganti diagnosis medis, terapi psikolog, psikiater, atau pengobatan klinis.
              </div>
              <p>
                Jika Anda sedang mengalami kondisi krisis kesehatan emosional yang parah, pemikiran menyakiti diri sendiri, atau situasi darurat medis lainnya, harap segera mencari bantuan profesional terdekat atau hubungi layanan darurat kesehatan mental nasional (seperti Hotline Kesehatan Mental Kemenkes atau Rumah Sakit terdekat).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">2. Pendaftaran Akun</h2>
              <p>
                Untuk menggunakan fitur Aplikasi secara penuh, Anda wajib membuat akun dengan memberikan alamat email yang aktif dan data informasi pendukung. Anda bertanggung jawab penuh atas kerahasiaan informasi sandi (password) akun Anda dan semua aktivitas yang dilakukan di bawah akun Anda.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">3. Hak Kekayaan Intelektual</h2>
              <p>
                Seluruh logo, merek dagang, desain antarmuka, algoritma, serta materi tulisan di dalam Aplikasi adalah hak milik eksklusif dari JN-CALM. Pengguna tidak diperkenankan menyalin, menyebarluaskan, atau memodifikasi bagian mana pun dari Aplikasi tanpa persetujuan tertulis sebelumnya.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">4. Layanan Premium dan Pembayaran</h2>
              <p>
                JN-CALM menawarkan paket berbayar ("Premium Plan") dengan fitur tambahan seperti obrolan tak terbatas dan pelacakan tanpa batas. Pembayaran dilakukan secara aman melalui gateway pembayaran resmi kami (Mayar.id).
              </p>
              <p>
                Seluruh transaksi bersifat final dan biaya langganan yang sudah dibayarkan tidak dapat dikembalikan (non-refundable), kecuali ditentukan lain dalam undang-undang yang berlaku.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">5. Tanggung Jawab Pengguna</h2>
              <p>
                Anda setuju untuk menggunakan Aplikasi hanya untuk tujuan yang sah, etis, dan mendukung kesehatan emosional Anda sendiri. Anda dilarang mengunggah konten yang mengandung kebencian, diskriminatif, pornografi, atau melanggar hak privasi orang lain.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">6. Batasan Tanggung Jawab & Risiko Keamanan</h2>
              <p>
                Kami berkomitmen menjaga keamanan data Anda dengan standar industri terenkripsi. Namun, Anda memahami bahwa tidak ada metode transmisi melalui internet atau penyimpanan elektronik yang 100% aman dan bebas dari risiko peretasan (hacking).
              </p>
              <p>
                Oleh karena itu, JN-CALM tidak bertanggung jawab atas segala kerugian, kebocoran data, atau kerusakan yang timbul akibat serangan siber, peretasan, kegagalan sistem, akses tidak sah pihak ketiga, atau kejadian di luar kendali wajar kami (Force Majeure). Penggunaan Aplikasi ini sepenuhnya merupakan risiko dan keputusan pribadi Anda sendiri.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">7. Perubahan Syarat Layanan</h2>
              <p>
                Kami berhak untuk mengubah atau memperbarui Syarat Layanan ini kapan saja. Kami akan mengumumkan setiap perubahan material kepada Anda dengan memperbarui tanggal revisi di bagian atas halaman ini. Melanjutkan penggunaan Aplikasi setelah pembaruan berarti Anda menyetujui syarat-syarat yang baru.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">8. Kontak Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang Syarat Layanan ini, silakan hubungi tim kami di <a href="mailto:noreply@jncalm.my.id" className="text-primary underline">noreply@jncalm.my.id</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Mini Footer */}
      <footer className="border-t border-border bg-card/25 py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} JN-CALM. Dibuat dengan 🤍 untuk hati yang lelah.</p>
      </footer>
    </div>
  );
}
