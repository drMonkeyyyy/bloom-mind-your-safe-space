import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Kebijakan Privasi · JN-CALM" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-muted-foreground">Terakhir diperbarui: 6 Juli 2026</p>
          <hr className="border-border" />

          <div className="prose prose-stone max-w-none space-y-8 text-sm leading-relaxed text-stone-700">
            <p>
              Privasi Anda sangat penting bagi kami di **JN-CALM** ("Aplikasi"). Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda ketika Anda menggunakan Aplikasi kami.
            </p>
            <p>
              Dengan menggunakan JN-CALM, Anda menyetujui pengumpulan dan penggunaan data sesuai dengan ketentuan di dalam Kebijakan Privasi ini.
            </p>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">1. Informasi yang Kami Kumpulkan</h2>
              <p>Kami mengumpulkan data Anda untuk memberikan dukungan dan personalisasi layanan terbaik:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>**Data Akun**: Alamat email yang Anda masukkan saat melakukan pendaftaran.</li>
                <li>**Data Profil**: Nama panggilan, rentang usia, serta tujuan personal yang Anda tentukan di halaman onboarding.</li>
                <li>**Data Penggunaan**: Catatan jurnal (diary), gratitude logs, kebiasaan (habits), serta pesan percakapan Anda dengan pendamping AI kami (Companion).</li>
                <li>**Data Transaksi**: Jika Anda berlangganan Premium, data pembayaran diolah secara aman dan terenkripsi oleh mitra gateway pembayaran kami (Mayar) secara langsung. Kami tidak menyimpan informasi detail kartu kredit atau virtual account Anda.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">2. Penggunaan Informasi</h2>
              <p>Data pribadi Anda digunakan untuk tujuan berikut:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Menyediakan, memelihara, dan meningkatkan kualitas fitur-fitur di Aplikasi.</li>
                <li>Mengirimkan respon dari Pendamping AI (Companion) yang dipersonalisasi sesuai gaya obrolan dan preferensi yang Anda pilih.</li>
                <li>Menampilkan grafik statistik perkembangan diri (mood tracker, growth statistics) pada dasbor Anda.</li>
                <li>Mengirimkan email verifikasi penting, pemulihan kata sandi, atau pemberitahuan status transaksi.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">3. Keamanan & Perlindungan Data</h2>
              <p>
                Seluruh data percakapan, jurnal, dan informasi pribadi Anda disimpan dengan aman menggunakan infrastruktur database terenkripsi (Supabase) dengan standar keamanan industri. Kami membatasi akses ke data sensitif Anda hanya untuk fungsi-fungsi sistem yang diperlukan untuk menjalankan Aplikasi.
              </p>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-emerald-900 text-xs">
                <strong>Prinsip Privasi Jurnal:</strong> Isi jurnal harian, rasa syukur, dan isi percakapan Anda dengan AI bersifat <strong>rahasia dan privat</strong>. Kami berkomitmen untuk <strong>tidak pernah menjual atau membagikan</strong> catatan tulisan emosional Anda kepada pihak ketiga mana pun untuk kepentingan iklan atau pemasaran.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">4. Berbagi Data dengan Pihak Ketiga</h2>
              <p>
                Kami hanya membagikan data Anda dengan penyedia pihak ketiga tepercaya (seperti API Kecerdasan Buatan untuk memproses respon percakapan AI, dan Supabase untuk database cloud) sejauh yang diperlukan untuk menjalankan layanan Aplikasi. Mitra ini berkewajiban menjaga kerahasiaan data Anda dan dilarang menggunakannya untuk tujuan lain.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">5. Hak-Hak Anda</h2>
              <p>
                Anda memiliki kendali penuh atas informasi pribadi Anda di Aplikasi. Anda berhak mengakses data Anda, mengubah profil Anda di dalam Aplikasi, atau meminta penghapusan akun Anda secara permanen beserta seluruh riwayat jurnal Anda dengan menghubungi tim bantuan kami.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">6. Pembaruan Kebijakan Privasi</h2>
              <p>
                Kami mungkin memperbarui Kebijakan Privasi ini dari waktu ke waktu. Setiap perubahan akan diumumkan dengan mengubah tanggal revisi di bagian atas halaman ini. Kami menyarankan Anda untuk membaca halaman ini secara berkala untuk mengetahui pembaruan terbaru.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">7. Hubungi Kami</h2>
              <p>
                Jika Anda memiliki kekhawatiran atau pertanyaan seputar cara kami menangani privasi dan data pribadi Anda, silakan hubungi kami di <a href="mailto:noreply@jncalm.my.id" className="text-primary underline">noreply@jncalm.my.id</a>.
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
