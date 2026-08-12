import { useState } from "react";
import { ShieldCheck, CheckCircle2, ArrowLeft, ArrowRight, UserCheck, FileText, Lock, XCircle } from "lucide-react";

interface CalmCheckConsentProps {
  onConsentGiven: () => void;
  onBack: () => void;
}

export function CalmCheckConsent({ onConsentGiven, onBack }: CalmCheckConsentProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-sm">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Persetujuan & Privasi Asesmen
        </h2>
        <p className="text-xs text-muted-foreground">
          Harap baca dan pahami ketentuan berikut sebelum memulai skrining Calm Check.
        </p>
      </div>

      {/* Consent Points Card */}
      <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-card space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Usia Pengguna</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Saya berusia minimal 17 tahun atau telah memiliki ijin pendamping untuk mengikuti asesmen mandiri.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Sifat Skrining Awal</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Hasil asesmen ini merupakan skrining awal emosional dan <strong className="text-foreground">bukan diagnosis medis</strong> dari psikiater/psikolog.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Penyimpanan & Keamanan Data</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Data hasil tes hanya akan disimpan dengan enkripsi Row Level Security setelah kamu memberikan persetujuan di akhir tes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <XCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Kebebasan Berhenti</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Kamu berhak dan bebas menghentikan atau membatalkan asesmen ini kapan saja tanpa konsekuensi apapun.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-border/50 my-2" />

        {/* Checkbox Input */}
        <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-primary/20 bg-primary-soft/40 p-3.5 transition-colors hover:bg-primary-soft/70">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-5 w-5 rounded-md border-primary text-primary focus:ring-primary accent-primary cursor-pointer"
          />
          <span className="text-xs font-bold text-foreground leading-snug">
            Saya memahami dan bersedia melanjutkan skrining Calm Check.
          </span>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <button
          disabled={!agreed}
          onClick={onConsentGiven}
          className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-bold transition-all shadow-soft ${
            agreed
              ? "bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
          }`}
        >
          <span>Lanjutkan Asesmen</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
