export function GrowthDashboard() {
  const moodPath = "M0,40 C30,20 50,55 80,30 C110,10 140,50 170,28 C200,12 230,38 260,20 C290,8 320,30 350,18";
  const triggers = [
    { name: "Tekanan kerja", pct: 78 },
    { name: "Kurang tidur", pct: 64 },
    { name: "Sosial media", pct: 52 },
    { name: "Sendirian malam hari", pct: 41 },
  ];

  return (
    <section className="relative py-14 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Growth Dashboard
          </p>
          <h2 className="mt-3 font-display text-2xl sm:text-5xl font-semibold leading-tight text-foreground">
            Lihat Perjalanan dan{" "}
            <span className="italic text-primary">Perkembangan Dirimu</span>
          </h2>
        </div>

        <div data-reveal className="relative mt-10 sm:mt-14 overflow-hidden rounded-3xl bg-card p-5 shadow-float ring-1 ring-border sm:p-10">
          {/* header row */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ringkasan Mingguan
              </p>
              <h3 className="mt-1 truncate font-display text-lg sm:text-2xl font-semibold text-foreground">
                Halo, hari ini kamu lebih tenang 🌿
              </h3>
            </div>
            <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-medium text-primary">
              +12% lebih baik
            </span>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {/* Mood trend */}
            <div className="lg:col-span-2 rounded-3xl bg-cream-deep/50 p-6">
              <div className="flex items-end justify-between">
                <p className="text-sm font-semibold text-foreground">Mood Trend</p>
                <p className="text-xs text-muted-foreground">7 hari</p>
              </div>
              <svg viewBox="0 0 350 70" className="mt-4 h-24 w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="moodFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${moodPath} L350,70 L0,70 Z`} fill="url(#moodFill)" />
                <path d={moodPath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                {["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mg"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>

            {/* Stress score ring */}
            <div className="rounded-3xl bg-cream-deep/50 p-6">
              <p className="text-sm font-semibold text-foreground">Stress Score</p>
              <div className="mt-3 grid place-items-center">
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-cream-deep)" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="10"
                      strokeDasharray="264"
                      strokeDashoffset="100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                      <p className="font-display text-2xl font-bold text-foreground">38</p>
                      <p className="text-[10px] text-muted-foreground">rendah</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Energy bars */}
            <div className="rounded-3xl bg-cream-deep/50 p-6">
              <p className="text-sm font-semibold text-foreground">Energy Level</p>
              <div className="mt-5 flex h-24 items-end gap-2">
                {[50, 70, 45, 80, 65, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-primary-soft" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Habit streak */}
            <div className="rounded-3xl bg-foreground p-6 text-cream">
              <p className="text-sm font-semibold opacity-80">Habit Streak</p>
              <p className="mt-3 font-display text-5xl font-bold">21<span className="text-2xl opacity-70"> hari</span></p>
              <div className="mt-4 flex gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className={`h-2 flex-1 rounded-full ${i < 6 ? "bg-accent" : "bg-cream/20"}`} />
                ))}
              </div>
              <p className="mt-3 text-xs opacity-70">Journaling pagi · konsisten</p>
            </div>

            {/* Triggers */}
            <div className="rounded-3xl bg-cream-deep/50 p-6">
              <p className="text-sm font-semibold text-foreground">Top Emotional Triggers</p>
              <div className="mt-4 space-y-3">
                {triggers.map((t) => (
                  <div key={t.name}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate text-foreground">{t.name}</span>
                      <span className="shrink-0 text-muted-foreground">{t.pct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-cream-deep">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${t.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
