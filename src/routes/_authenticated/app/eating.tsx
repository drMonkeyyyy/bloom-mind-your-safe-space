import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeEmotionalEating } from "@/lib/chat.functions";
import { toast } from "sonner";

const HUNGER = [
  { key: "lapar_fisik", label: "Lapar fisik" },
  { key: "lapar_emosional", label: "Lapar emosional" },
  { key: "craving", label: "Craving" },
  { key: "stress_eating", label: "Stress eating" },
  { key: "mindless_eating", label: "Mindless eating" },
] as const;

export const Route = createFileRoute("/_authenticated/app/eating")({
  component: Page,
});

function Page() {
  const analyze = useServerFn(analyzeEmotionalEating);
  const [hunger, setHunger] = useState<(typeof HUNGER)[number]["key"] | null>(null);
  const [emotion, setEmotion] = useState("");
  const [food, setFood] = useState("");
  const [trigger, setTrigger] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ insight: string; action: string } | null>(null);

  const submit = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await analyze({ data: { hungerType: hunger, emotion, cravingFood: food, trigger } });
      setResult(res);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Emotional Eating Mode</h1>
        <p className="mt-1 text-sm text-muted-foreground">"Tidak semua rasa lapar berasal dari perut."</p>
      </div>

      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4">
        <div>
          <p className="text-sm font-medium">Apa yang sebenarnya kamu rasakan?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {HUNGER.map((h)=>(
              <button key={h.key} onClick={()=>setHunger(h.key)}
                className={`rounded-full border px-3 py-1.5 text-xs ${hunger===h.key?"border-primary bg-primary-soft font-semibold":"border-border"}`}>{h.label}</button>
            ))}
          </div>
        </div>
        <input value={emotion} onChange={(e)=>setEmotion(e.target.value)} placeholder="Emosi yang sedang dirasakan…" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
        <input value={food} onChange={(e)=>setFood(e.target.value)} placeholder="Makanan yang ingin kamu makan…" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
        <input value={trigger} onChange={(e)=>setTrigger(e.target.value)} placeholder="Trigger apa yang muncul?" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
        <button onClick={submit} disabled={loading} className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-peach disabled:opacity-60">
          {loading ? "Menganalisis…" : "Minta insight AI"}
        </button>
      </section>

      {result && (
        <section className="rounded-3xl bg-gradient-to-br from-primary-soft to-accent-soft p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Insight Bloom Mind</p>
          <p className="mt-3 text-sm leading-relaxed">{result.insight}</p>
          <div className="mt-4 rounded-2xl bg-card/80 p-4 text-sm"><strong>Coba ini:</strong> {result.action}</div>
        </section>
      )}
    </div>
  );
}
