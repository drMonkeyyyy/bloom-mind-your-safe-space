import { Clock, ShieldCheck, Info, Sparkles, ArrowRight, History } from "lucide-react";

interface CalmCheckOpeningProps {
  onStart: () => void;
  onViewHistory: () => void;
  hasHistory: boolean;
}

export function CalmCheckOpening({ onStart, onViewHistory, hasHistory }: CalmCheckOpeningProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center animate-fade-in-up">
      {/* Top Tag */}
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md">
        <Sparkles className="h-4 w-4 animate-spin-slow text-amber-500" />
        <span>Fitur Baru: Asesmen Mandiri JN-CALM</span>
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Bagaimana kondisi mentalmu belakangan ini?
        </h1>
        <p className="text-base font-medium text-muted-foreground sm:text-lg">
          Kenali tingkat stres, kecemasan, dan suasana hatimu dalam 3–5 menit.
        </p>
      </div>

      {/* Abstract Soft Illustration Container */}
      <div className="relative mx-auto my-6 flex h-48 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-cream via-primary-soft/30 to-accent-soft/40 p-6 shadow-soft">
        {/* Decorative Floating Blobs */}
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl animate-blob-drift" />
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl animate-blob-drift" style={{ animationDelay: "3s" }} />

        {/* Abstract SVG Illustration */}
        <svg viewBox="0 0 200 160" fill="none" className="h-36 w-auto text-primary animate-float">
          <circle cx="100" cy="80" r="45" fill="currentColor" fillOpacity="0.1" />
          <path d="M70 90C75 75 90 65 105 70C120 75 130 90 125 105C120 120 95 125 80 115C65 105 65 105 70 90Z" fill="url(#grad1)" fillOpacity="0.6" />
          <path d="M110 50C125 45 140 55 145 70C150 85 135 100 120 105C105 110 95 95 100 80C105 65 95 55 110 50Z" fill="url(#grad2)" fillOpacity="0.4" />
          <defs>
            <linearGradient id="grad1" x1="70" y1="65" x2="130" y2="125" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8AAE9F" />
              <stop offset="1" stopColor="#E2A58D" />
            </linearGradient>
            <linearGradient id="grad2" x1="95" y1="45" x2="150" y2="105" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E2A58D" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute bottom-3 text-center">
          <p className="text-xs font-semibold text-primary/80">
            Jawab 21 pertanyaan singkat berdasarkan pengalamanmu 1 minggu terakhir.
          </p>
        </div>
      </div>

      {/* Feature Badges */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/80 p-3.5 shadow-card text-left transition-transform duration-200 hover:scale-[1.02]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Durasi Ringkas</p>
            <p className="text-[11px] text-muted-foreground">3–5 Menit Saja</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/80 p-3.5 shadow-card text-left transition-transform duration-200 hover:scale-[1.02]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Privasi Terjamin</p>
            <p className="text-[11px] text-muted-foreground">Hasil Hanya Milikmu</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/80 p-3.5 shadow-card text-left transition-transform duration-200 hover:scale-[1.02]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Instrumen Resmi</p>
            <p className="text-[11px] text-muted-foreground">DASS-21 Tervalidasi</p>
          </div>
        </div>
      </div>

      {/* Subtle Disclaimer Banner */}
      <div className="rounded-2xl border border-border/60 bg-cream-deep/40 p-3.5 text-left">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-[11px] leading-relaxed">
            <strong className="font-semibold text-foreground">Catatan Penting:</strong> Calm Check adalah skrining mandiri awal untuk membantu kamu menemukan rekomendasi fitur JN-CALM yang paling tepat. Hasil ini bukan diagnosis medis.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-3">
        <button
          onClick={onStart}
          className="group relative inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-primary/90 px-8 py-4 text-base font-bold text-white shadow-soft transition-all duration-300 hover:scale-[1.01] hover:shadow-float active:scale-[0.99] sm:w-auto"
        >
          <span>Mulai Calm Check</span>
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>

        <div>
          <button
            onClick={onViewHistory}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-primary hover:bg-primary-soft/60 transition-colors"
          >
            <History className="h-4 w-4" />
            <span>{hasHistory ? "Lihat Riwayat Asesmen Sebelumnya" : "Cek Riwayat Check"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
