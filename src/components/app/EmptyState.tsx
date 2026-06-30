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
      className={`flex flex-col items-center justify-center rounded-3xl bg-cream-deep/60 px-6 py-14 text-center animate-scale-in ${className}`}
    >
      {emoji && (
        <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-card shadow-card text-4xl">
          {emoji}
        </div>
      )}
      {icon && (
        <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-card shadow-card text-primary">
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
          className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
