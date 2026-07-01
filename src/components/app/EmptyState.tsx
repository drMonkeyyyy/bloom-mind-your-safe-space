import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  emoji,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl px-6 py-14 text-center animate-scale-in ${className}`}
      style={{
        background: "linear-gradient(145deg, oklch(0.97 0.008 85) 0%, oklch(0.96 0.015 140) 100%)",
        border: "1px solid oklch(0.89 0.015 80 / 0.6)",
      }}
    >
      {emoji && (
        <div
          className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-card shadow-card text-4xl"
          style={{
            animation: "float 9s ease-in-out infinite",
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.10), 0 0 0 6px oklch(0.92 0.025 160 / 0.3)",
          }}
        >
          {emoji}
        </div>
      )}
      {icon && (
        <div
          className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-card shadow-card text-primary"
          style={{
            animation: "float 9s ease-in-out infinite",
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.10), 0 0 0 6px oklch(0.92 0.025 160 / 0.3)",
          }}
        >
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 btn-spring"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
