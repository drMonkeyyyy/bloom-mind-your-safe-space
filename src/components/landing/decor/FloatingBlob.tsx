export function FloatingBlob({
  className = "",
  color = "primary",
  size = 320,
  delay = 0,
  slow = false,
}: {
  className?: string;
  color?: "primary" | "accent" | "cream";
  size?: number;
  delay?: number;
  slow?: boolean;
}) {
  const bg =
    color === "primary"
      ? "bg-primary-soft"
      : color === "accent"
        ? "bg-accent-soft"
        : "bg-cream-deep";
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-70 ${bg} ${slow ? "animate-float-slow" : "animate-float"} ${className}`}
      style={{
        width: size,
        height: size,
        animationDelay: `${delay}s`,
      }}
    />
  );
}
