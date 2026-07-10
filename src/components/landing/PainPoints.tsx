const items = [
  { emoji: "😔", text: "Overthinking sebelum tidur" },
  { emoji: "😞", text: "Merasa capek tapi tidak tahu kenapa" },
  { emoji: "😢", text: "Tidak punya tempat untuk curhat" },
  { emoji: "😰", text: "Cemas tentang masa depan" },
  { emoji: "🍫", text: "Makan saat stres atau sedih" },
  { emoji: "💔", text: "Merasa sendirian walaupun ramai" },
];

export function PainPoints() {
  return (
    <section id="pernah-merasa" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Kamu tidak sendirian
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Pernah Merasa Seperti Ini?
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={it.text}
              data-reveal
              style={{ transitionDelay: `${i * 60}ms` }}
              className="group flex items-start gap-4 rounded-3xl bg-card p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-soft hover:ring-primary-soft"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cream-deep text-2xl transition-transform group-hover:scale-110">
                {it.emoji}
              </span>
              <p className="pt-3 text-base font-medium leading-snug text-foreground">
                {it.text}
              </p>
            </div>
          ))}
        </div>

        <p data-reveal className="mx-auto mt-14 max-w-xl text-center font-display text-2xl italic leading-relaxed text-foreground sm:text-3xl">
          Kamu tidak sendirian. Banyak orang mengalami hal yang sama setiap hari.
        </p>
      </div>
    </section>
  );
}
