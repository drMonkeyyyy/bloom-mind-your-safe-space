import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { CalmCheckOpening } from "@/components/calm-check/CalmCheckOpening";
import { CalmCheckConsent } from "@/components/calm-check/CalmCheckConsent";
import { CalmCheckQuestionnaire } from "@/components/calm-check/CalmCheckQuestionnaire";
import { CalmCheckSafetyGate } from "@/components/calm-check/CalmCheckSafetyGate";
import { CalmCheckResults } from "@/components/calm-check/CalmCheckResults";
import { CalmCheckHistoryModal, HistoryItem } from "@/components/calm-check/CalmCheckHistoryModal";
import { calculateDASS21Scores, DASS21Scores } from "@/lib/dass21";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/calm-check")({
  component: CalmCheckPage,
});

type Step = "opening" | "consent" | "questionnaire" | "safety" | "results";

const LOCAL_STORAGE_DRAFT_KEY = "jn_calm_check_answers_draft";

function CalmCheckPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("opening");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [safetyFlag, setSafetyFlag] = useState<boolean>(false);
  const [scores, setScores] = useState<DASS21Scores | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);

  // Load draft answers from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
      if (saved) {
        setAnswers(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Gagal memuat draft jawaban:", e);
    }
  }, []);

  const LOCAL_STORAGE_HISTORY_KEY = `jn_calm_check_history_${user?.id || "guest"}`;

  // Fetch assessment history from Supabase (with LocalStorage fallback)
  const fetchHistory = async () => {
    let remoteHistory: HistoryItem[] = [];
    if (user) {
      try {
        const { data, error } = await supabase
          .from("calm_check_results" as any)
          .select("id, created_at, depression_score, anxiety_score, stress_score, depression_category, anxiety_category, stress_category")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          remoteHistory = data as any[];
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to LocalStorage:", err);
      }
    }

    // Merge with LocalStorage history
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      const localHistory: HistoryItem[] = localData ? JSON.parse(localData) : [];

      const combined = [...remoteHistory];
      localHistory.forEach((localItem) => {
        if (!combined.some((item) => item.id === localItem.id)) {
          combined.push(localItem);
        }
      });

      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setHistory(combined);
    } catch (e) {
      setHistory(remoteHistory);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Handle questionnaire draft answer updates
  const handleAnswersChange = (newAnswers: Record<number, number>) => {
    setAnswers(newAnswers);
    try {
      localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(newAnswers));
    } catch (e) {
      console.error("Gagal menyimpan draft jawaban:", e);
    }
  };

  // Step transitions
  const handleStart = () => {
    setStep("consent");
  };

  const handleConsentGiven = () => {
    setStep("questionnaire");
  };

  const handleQuestionnaireComplete = (finalAnswers: Record<number, number>) => {
    setAnswers(finalAnswers);
    const computedScores = calculateDASS21Scores(finalAnswers);
    setScores(computedScores);
    setStep("safety");
  };

  const handleSafetyAnswer = (hasRisk: boolean, rawValue: number) => {
    setSafetyFlag(hasRisk);
    setStep("results");
  };

  // Save results to Supabase table calm_check_results (with LocalStorage fallback)
  const handleSaveResults = async () => {
    if (!scores) return;
    setIsSaving(true);

    const newRecord: HistoryItem = {
      id: `local_${Date.now()}`,
      created_at: new Date().toISOString(),
      depression_score: scores.depression.score,
      anxiety_score: scores.anxiety.score,
      stress_score: scores.stress.score,
      depression_category: scores.depression.category,
      anxiety_category: scores.anxiety.category,
      stress_category: scores.stress.category
    };

    let savedToCloud = false;

    if (user) {
      try {
        const { data, error } = await supabase.from("calm_check_results" as any).insert({
          user_id: user.id,
          depression_score: scores.depression.score,
          anxiety_score: scores.anxiety.score,
          stress_score: scores.stress.score,
          depression_category: scores.depression.category,
          anxiety_category: scores.anxiety.category,
          stress_category: scores.stress.category,
          answers: answers,
          consent_given: true,
          safety_flag: safetyFlag,
          recommendations: scores.dominantDomain
        }).select();

        if (!error) {
          savedToCloud = true;
          if (data && data[0]) {
            newRecord.id = data[0].id;
          }
        } else {
          console.warn("Supabase save returned error, saving locally:", error);
        }
      } catch (err) {
        console.warn("Supabase save exception, saving locally:", err);
      }
    }

    // Save to LocalStorage fallback
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      const currentLocal: HistoryItem[] = localData ? JSON.parse(localData) : [];
      currentLocal.unshift(newRecord);
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(currentLocal));
    } catch (e) {
      console.error("Gagal menyimpan ke LocalStorage:", e);
    }

    setIsSaving(false);
    setIsSaved(true);

    if (savedToCloud) {
      toast.success("Hasil Calm Check berhasil disimpan ke akunmu! 🌸");
    } else {
      toast.success("Hasil Calm Check tersimpan dengan aman! 🌸");
    }

    localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
    fetchHistory();
  };

  // Delete current result or a history item
  const handleDeleteHistoryItem = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("calm_check_results" as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Riwayat asesmen berhasil dihapus.");
      fetchHistory();
    } catch (err: any) {
      console.error("Gagal menghapus riwayat:", err);
      toast.error("Gagal menghapus data riwayat.");
    }
  };

  const handleRetakeLater = () => {
    localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
    setAnswers({});
    setScores(null);
    setIsSaved(false);
    setStep("opening");
    toast.info("Sampai jumpa di asesmen Calm Check berikutnya! 🍃");
  };

  const previousAssessment = history.length > 0 ? {
    depression: history[0].depression_score,
    anxiety: history[0].anxiety_score,
    stress: history[0].stress_score,
    createdAt: history[0].created_at
  } : null;

  return (
    <div className="min-h-screen pb-16 pt-4 px-4 sm:px-6">
      {/* Step Render */}
      {step === "opening" && (
        <CalmCheckOpening
          onStart={handleStart}
          onViewHistory={() => setHistoryModalOpen(true)}
          hasHistory={history.length > 0}
        />
      )}

      {step === "consent" && (
        <CalmCheckConsent
          onConsentGiven={handleConsentGiven}
          onBack={() => setStep("opening")}
        />
      )}

      {step === "questionnaire" && (
        <CalmCheckQuestionnaire
          initialAnswers={answers}
          onAnswersChange={handleAnswersChange}
          onComplete={handleQuestionnaireComplete}
          onCancel={() => setStep("opening")}
        />
      )}

      {step === "safety" && (
        <CalmCheckSafetyGate
          onSafetyAnswer={handleSafetyAnswer}
        />
      )}

      {step === "results" && scores && (
        <CalmCheckResults
          scores={scores}
          answers={answers}
          previousScores={previousAssessment}
          onSave={handleSaveResults}
          onRetakeLater={handleRetakeLater}
          onViewHistory={() => setHistoryModalOpen(true)}
          isSaved={isSaved}
          isSaving={isSaving}
        />
      )}

      {/* History Modal */}
      <CalmCheckHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={history}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />
    </div>
  );
}
