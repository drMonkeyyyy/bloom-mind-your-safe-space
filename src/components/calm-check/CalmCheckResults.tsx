import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import type { DASS21Scores, RecommendationItem } from "@/lib/dass21";
import { getPersonalizedRecommendations } from "@/lib/dass21";
import {
  Sparkles,
  Save,
  Trash2,
  RotateCcw,
  TrendingUp,
  Share2,
  ShieldCheck,
  Check,
  ArrowRight,
  Info,
  Wind,
  Activity,
  Anchor,
  BookOpen,
  Feather,
  Heart,
  Smile,
  CheckCircle2
} from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface CalmCheckResultsProps {
  scores: DASS21Scores;
  previousScores?: {
    depression: number;
    anxiety: number;
    stress: number;
    createdAt: string;
  } | null;
  onSave: () => void;
  onDelete?: () => void;
  onRetakeLater: () => void;
  onViewHistory: () => void;
  isSaved: boolean;
  isSaving: boolean;
}

export function CalmCheckResults({
  scores,
  previousScores,
  onSave,
  onDelete,
  onRetakeLater,
  onViewHistory,
  isSaved,
  isSaving
}: CalmCheckResultsProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const recommendations: RecommendationItem[] = getPersonalizedRecommendations(scores);

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement("a");
      link.download = `Calm-Check-Results-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Kartu ringkasan berhasil diunduh! 📸");
    } catch (err) {
      console.error("Gagal mengunduh gambar:", err);
      toast.error("Gagal menyimpan gambar kartu ringkasan.");
    } finally {
      setDownloading(false);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Wind": return <Wind className="h-5 w-5" />;
      case "Activity": return <Activity className="h-5 w-5" />;
      case "Anchor": return <Anchor className="h-5 w-5" />;
      case "BookOpen": return <BookOpen className="h-5 w-5" />;
      case "Feather": return <Feather className="h-5 w-5" />;
      case "Heart": return <Heart className="h-5 w-5" />;
      case "Smile": return <Smile className="h-5 w-5" />;
      case "CheckCircle2": return <CheckCircle2 className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getComparisonText = (current: number, prev?: number) => {
    if (prev === undefined) return null;
    const diff = current - prev;
    if (diff === 0) return "Sama dengan minggu lalu";
    if (diff < 0) return `Turun ${Math.abs(diff)} poin dibanding minggu lalu 📈`;
    return `Naik ${diff} poin dibanding minggu lalu`;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Hasil Skrining Calm Check</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ini gambaran kondisi emosionalmu minggu ini
        </h1>
        <p className="text-xs text-muted-foreground">
          Berdasarkan 21 jawaban pengalamanmu selama 1 minggu terakhir.
        </p>
      </div>

      {/* Main Results Container (Target for Export/Download) */}
      <div ref={cardRef} className="space-y-6 rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 shadow-card">
        {/* 3 Domain Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Depresi */}
          <div className={`rounded-2xl border p-4 transition-all ${scores.depression.bgLight}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Depresi</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${scores.depression.badgeBg}`}>
                {scores.depression.category}
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-1">
              <span className="font-display text-3xl font-extrabold text-foreground">
                {scores.depression.score}
              </span>
              <span className="text-xs text-muted-foreground">/ 42</span>
            </div>
            {/* Horizontal Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${scores.depression.color.includes("emerald") ? "bg-emerald-500" : scores.depression.color.includes("amber") ? "bg-amber-500" : scores.depression.color.includes("rose") ? "bg-rose-500" : "bg-sky-500"}`}
                style={{ width: `${Math.min(100, Math.max(5, (scores.depression.score / 42) * 100))}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {scores.depression.explanation}
            </p>
            {previousScores && (
              <p className="mt-2 text-[10px] font-semibold text-primary">
                {getComparisonText(scores.depression.score, previousScores.depression)}
              </p>
            )}
          </div>

          {/* Kecemasan */}
          <div className={`rounded-2xl border p-4 transition-all ${scores.anxiety.bgLight}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Kecemasan</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${scores.anxiety.badgeBg}`}>
                {scores.anxiety.category}
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-1">
              <span className="font-display text-3xl font-extrabold text-foreground">
                {scores.anxiety.score}
              </span>
              <span className="text-xs text-muted-foreground">/ 42</span>
            </div>
            {/* Horizontal Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${scores.anxiety.color.includes("emerald") ? "bg-emerald-500" : scores.anxiety.color.includes("amber") ? "bg-amber-500" : scores.anxiety.color.includes("rose") ? "bg-rose-500" : "bg-sky-500"}`}
                style={{ width: `${Math.min(100, Math.max(5, (scores.anxiety.score / 42) * 100))}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {scores.anxiety.explanation}
            </p>
            {previousScores && (
              <p className="mt-2 text-[10px] font-semibold text-primary">
                {getComparisonText(scores.anxiety.score, previousScores.anxiety)}
              </p>
            )}
          </div>

          {/* Stres */}
          <div className={`rounded-2xl border p-4 transition-all ${scores.stress.bgLight}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Stres</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${scores.stress.badgeBg}`}>
                {scores.stress.category}
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-1">
              <span className="font-display text-3xl font-extrabold text-foreground">
                {scores.stress.score}
              </span>
              <span className="text-xs text-muted-foreground">/ 42</span>
            </div>
            {/* Horizontal Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${scores.stress.color.includes("emerald") ? "bg-emerald-500" : scores.stress.color.includes("amber") ? "bg-amber-500" : scores.stress.color.includes("rose") ? "bg-rose-500" : "bg-sky-500"}`}
                style={{ width: `${Math.min(100, Math.max(5, (scores.stress.score / 42) * 100))}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {scores.stress.explanation}
            </p>
            {previousScores && (
              <p className="mt-2 text-[10px] font-semibold text-primary">
                {getComparisonText(scores.stress.score, previousScores.stress)}
              </p>
            )}
          </div>
        </div>

        {/* JN-CALM Supportive Solution Summary */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary-soft/50 via-cream to-accent-soft/40 p-4.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Panduan Pemulihan Mandiri JN-CALM</span>
          </div>
          <p className="text-xs leading-relaxed text-foreground/90 font-medium">
            "Hasil skrining ini adalah kompas emosionalmu. Dengan rutin menjalankan rekomendasi fitur JN-CALM di bawah ini secara berkala, kamu dapat memulihkan energi, merilis rasa cemas, dan menemukan kembali kedamaian batinmu."
          </p>
        </div>
      </div>

      {/* Personalized Recommendations Section */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="font-display text-xl font-bold text-foreground">
            Rekomendasi Terpersonalisasi Untukmu
          </h3>
          <p className="text-xs text-muted-foreground">
            3 langkah JN-CALM terbaik yang disesuaikan dengan kondisi emosionalmu saat ini:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {recommendations.map((rec) => (
            <Link
              key={rec.id}
              to={rec.path as any}
              className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-surface p-4 shadow-card transition-all duration-300 hover:scale-[1.02] hover:shadow-float hover:border-primary/50"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-110">
                    {renderIcon(rec.iconName)}
                  </span>
                  <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
                    {rec.badgeText}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {rec.title}
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {rec.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-primary">
                <span>Coba Sekarang</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Re-assessment Advice */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900/40 dark:bg-sky-950/30">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
          <p className="text-xs text-sky-900/90 dark:text-sky-200/90 leading-relaxed">
            <strong className="font-semibold">Saran Frekuensi:</strong> Asesmen Calm Check disarankan dilakukan berkala setiap 1–2 minggu untuk mengamati dinamika perkembangan emosionalmu. Mengulangi tes berulang kali dalam satu hari tidak direkomendasikan.
          </p>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={isSaved || isSaving}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition-all shadow-soft ${
              isSaved
                ? "bg-emerald-600 text-white"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>{isSaved ? "Hasil Tersimpan" : isSaving ? "Menyimpan..." : "Simpan Hasil"}</span>
          </button>

          <button
            onClick={onViewHistory}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Lihat Perkembangan</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCard}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            title="Unduh Kartu Ringkasan"
          >
            <Share2 className="h-4 w-4" />
            <span>{downloading ? "Mengunduh..." : "Bagikan Ringkasan"}</span>
          </button>

          {onDelete && isSaved && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
              title="Hapus Hasil Ini"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Hasil</span>
            </button>
          )}

          <button
            onClick={onRetakeLater}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Ulangi Nanti</span>
          </button>
        </div>
      </div>
    </div>
  );
}
