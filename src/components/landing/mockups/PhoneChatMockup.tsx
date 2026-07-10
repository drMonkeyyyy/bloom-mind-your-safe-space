import { useState, useEffect } from "react";

export function PhoneChatMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let delay = 1800; // Default transition delay
    if (step === 1) delay = 1500; // User replies, wait before typing
    if (step === 2) delay = 1800; // Typing indicator displays
    if (step === 3) delay = 2200; // Aira replies, delay before showing cards
    if (step === 4) delay = 6000; // Wait at final state before resetting

    const timer = setTimeout(() => {
      setStep((prev) => (prev === 4 ? 0 : prev + 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      {/* Floating mood card */}
      <div
        className={`absolute -left-10 top-16 z-20 hidden w-48 rounded-3xl bg-card p-4 shadow-float ring-1 ring-border sm:block transition-all duration-700 transform ${
          step === 4 ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-4 scale-95 pointer-events-none"
        }`}
        style={step === 4 ? { animation: "float 8s ease-in-out infinite" } : undefined}
      >
        <p className="text-xs font-medium text-muted-foreground">Mood Hari Ini</p>
        <p className="mt-1 font-display text-lg font-semibold text-foreground">
          Tenang 🌿
        </p>
        <div className="mt-3 flex h-10 items-end gap-1.5">
          {[40, 60, 35, 75, 55, 85, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-primary-soft"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Floating insight card */}
      <div
        className={`absolute -right-6 bottom-20 z-20 hidden w-44 rounded-3xl bg-card p-4 shadow-float ring-1 ring-border sm:block transition-all duration-700 transform ${
          step === 4 ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-4 scale-95 pointer-events-none"
        }`}
        style={step === 4 ? { animation: "float 10s ease-in-out infinite", animationDelay: "1s" } : undefined}
      >
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-accent">
            ✨
          </span>
          <p className="text-xs font-semibold text-foreground">Insight</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Kamu lebih tenang setelah journaling pagi.
        </p>
      </div>

      {/* Phone */}
      <div className="relative aspect-[9/19] w-full rounded-[3rem] bg-foreground p-3 shadow-float">
        <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-cream">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground" />

          <div className="flex h-full flex-col px-4 pt-10 pb-4">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-lg">
                👩
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">Kakak Aira</p>
                <p className="truncate text-[10px] text-primary">● Online untukmu</p>
              </div>
            </div>

            {/* Chat */}
            <div className="flex-1 space-y-3 overflow-hidden pt-4">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-primary-soft px-3 py-2 transition-opacity duration-300">
                <p className="text-[11px] leading-relaxed text-foreground">
                  Hai, gimana harimu? Aku di sini buat dengerin 🤍
                </p>
              </div>
              
              <div 
                className={`ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-accent px-3 py-2 text-accent-foreground transition-all duration-500 transform ${
                  step >= 1 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                }`}
              >
                <p className="text-[11px] leading-relaxed">
                  Capek banget. Overthinking dari semalem...
                </p>
              </div>

              {step === 2 && (
                <div className="flex items-center gap-1.5 pl-2 py-1 transition-all duration-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              )}

              <div 
                className={`max-w-[85%] rounded-2xl rounded-tl-sm bg-primary-soft px-3 py-2 transition-all duration-500 transform ${
                  step >= 3 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                }`}
              >
                <p className="text-[11px] leading-relaxed text-foreground">
                  Wajar kok ngerasa gitu. Mau cerita pelan-pelan? Aku temenin 🌿
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="mt-3 flex items-center gap-2 rounded-full bg-card px-3 py-2 ring-1 ring-border">
              <span className="text-xs text-muted-foreground">Tulis perasaanmu…</span>
              <span className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-accent text-accent-foreground">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path d="M5 12l14-7-5 14-3-6-6-1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
