import { useState, useEffect } from "react";
import { DASS21_ITEMS, RESPONSE_OPTIONS } from "@/lib/dass21";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, AlertCircle, Info } from "lucide-react";

interface CalmCheckQuestionnaireProps {
  initialAnswers: Record<number, number>;
  onAnswersChange: (answers: Record<number, number>) => void;
  onComplete: (answers: Record<number, number>) => void;
  onCancel: () => void;
}

export function CalmCheckQuestionnaire({
  initialAnswers,
  onAnswersChange,
  onComplete,
  onCancel
}: CalmCheckQuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<number, number>>(initialAnswers);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state & autosave
  const handleSelectOption = (value: number) => {
    const item = DASS21_ITEMS[currentIndex];
    const newAnswers = { ...answers, [item.id]: value };
    setAnswers(newAnswers);
    onAnswersChange(newAnswers);
    setErrorMsg(null);

    // Auto advance smoothly after short delay
    if (currentIndex < DASS21_ITEMS.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 220);
    }
  };

  const currentItem = DASS21_ITEMS[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / DASS21_ITEMS.length) * 100);

  const isAllAnswered = DASS21_ITEMS.every((item) => answers[item.id] !== undefined);

  const handleNext = () => {
    if (answers[currentItem.id] === undefined) {
      setErrorMsg("Harap pilih salah satu jawaban terlebih dahulu sebelum melanjutkan.");
      return;
    }
    if (currentIndex < DASS21_ITEMS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Check if all answered
      if (!isAllAnswered) {
        // Find first unanswered
        const unansweredIdx = DASS21_ITEMS.findIndex((item) => answers[item.id] === undefined);
        if (unansweredIdx !== -1) {
          setCurrentIndex(unansweredIdx);
          setErrorMsg(`Harap jawab Pertanyaan ${unansweredIdx + 1} terlebih dahulu.`);
          return;
        }
      }
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setErrorMsg(null);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in-up">
      {/* Top Header & Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>Pertanyaan {currentIndex + 1} dari 21</span>
          <span className="text-primary">{progressPercent}% Selesai</span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-cream-deep/80 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Guidance Reminder */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
        <span>Pengalaman 1 minggu terakhir</span>
        <button
          onClick={onCancel}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Hentikan Asesmen
        </button>
      </div>

      {/* Question Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 shadow-card transition-all">
        {/* Soft Background Accent Circle */}
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary-soft/40 blur-2xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              Pertanyaan Ke-{currentItem.id}
            </span>
            <h3 className="font-display text-xl font-bold text-foreground sm:text-2xl leading-snug">
              "{currentItem.text}"
            </h3>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Response Options */}
          <div className="space-y-2.5 pt-2">
            {RESPONSE_OPTIONS.map((opt) => {
              const isSelected = answers[currentItem.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`group flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary-soft/70 shadow-sm scale-[1.01]"
                      : "border-border/70 bg-card hover:border-primary/40 hover:bg-cream-deep/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border text-muted-foreground group-hover:border-primary/50"
                      }`}
                    >
                      {opt.value}
                    </span>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 animate-scale-in" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Navigation Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-5 py-3 text-xs font-semibold ${
            currentIndex === 0
              ? "opacity-40 cursor-not-allowed text-muted-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        {/* Question Counter Dots indicator for quick jump / visual progress */}
        <div className="hidden sm:flex items-center gap-1">
          {DASS21_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "w-5 bg-primary"
                  : answers[item.id] !== undefined
                  ? "w-2 bg-primary/40"
                  : "w-2 bg-border"
              }`}
              title={`Pertanyaan ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-soft transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{currentIndex === DASS21_ITEMS.length - 1 ? "Selesai & Lihat Hasil" : "Lanjut"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
