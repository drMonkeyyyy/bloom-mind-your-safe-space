import { useState } from "react";
import { SAFETY_CHECK_QUESTION } from "@/lib/dass21";
import { ShieldAlert, ArrowRight, Info, AlertTriangle, LifeBuoy } from "lucide-react";

interface CalmCheckSafetyGateProps {
  onSafetyAnswer: (safetyFlag: boolean, rawValue: number) => void;
}

export function CalmCheckSafetyGate({ onSafetyAnswer }: CalmCheckSafetyGateProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (val: number) => {
    setSelectedOption(val);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    onSafetyAnswer(selectedOption > 0, selectedOption);
  };

  const isRiskDetected = selectedOption !== null && selectedOption > 0;

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 shadow-sm">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Pemeriksaan Keselamatan Diri
        </h2>
        <p className="text-xs text-muted-foreground">
          Langkah terakhir sebelum melihat hasil asesmen emosionalmu.
        </p>
      </div>

      {/* Question Card */}
      <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-card space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Pertanyaan Keselamatan
          </p>
          <h3 className="font-display text-base font-bold text-foreground leading-snug">
            {SAFETY_CHECK_QUESTION.text}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {SAFETY_CHECK_QUESTION.options.map((opt) => {
            const isSelected = selectedOption === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? opt.value > 0
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-sm"
                      : "border-primary bg-primary-soft/70 shadow-sm"
                    : "border-border/70 bg-card hover:border-primary/40 hover:bg-cream-deep/40"
                }`}
              >
                <input
                  type="radio"
                  name="safety_option"
                  checked={isSelected}
                  onChange={() => handleSelect(opt.value)}
                  className="mt-0.5 h-4 w-4 text-primary accent-primary"
                />
                <div>
                  <p className="text-xs font-bold text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Emergency Calm & IGD Text Guidance if Risk Detected */}
        {isRiskDetected && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-5 dark:border-rose-900/60 dark:bg-rose-950/60 space-y-2 animate-fade-in-up">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Panduan Penenangan & Keselamatan Diri
                </h4>
                <p className="text-xs leading-relaxed text-rose-800 dark:text-rose-300">
                  "Kamu tidak harus menghadapi rasa tegang atau cemas ini sendirian. Setelah melihat hasil asesmen di langkah berikutnya, kamu disarankan untuk mencoba modul <strong className="font-semibold text-rose-950 dark:text-rose-100">Emergency Calm JN-CALM</strong> untuk merilis ketegangan pikiran. Namun, jika kamu merasa tidak aman atau tidak sanggup bertahan, segera minta bantuan orang terdekat atau langsung menuju ke <strong className="font-semibold text-rose-950 dark:text-rose-100">IGD fasilitas kesehatan terdekat</strong>."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit / Proceed Button */}
      <div className="flex justify-end pt-2">
        <button
          disabled={selectedOption === null}
          onClick={handleSubmit}
          className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-bold transition-all shadow-soft ${
            selectedOption !== null
              ? "bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
          }`}
        >
          <span>Tampilkan Hasil Calm Check</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
