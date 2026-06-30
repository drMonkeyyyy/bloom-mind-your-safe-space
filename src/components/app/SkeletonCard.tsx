import type { ReactNode } from "react";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  children?: ReactNode;
}

export function SkeletonCard({ className = "", lines = 3, children }: SkeletonCardProps) {
  if (children) {
    return (
      <div className={`rounded-3xl bg-card p-6 ring-1 ring-border ${className}`}>
        {children}
      </div>
    );
  }
  return (
    <div className={`rounded-3xl bg-card p-6 ring-1 ring-border space-y-3 ${className}`}>
      <div className="skeleton h-4 w-1/3 rounded-full" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded-full"
          style={{ width: `${85 - i * 12}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-3 rounded-full ${className}`} />;
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="skeleton shrink-0 rounded-full"
      style={{ width: size, height: size }}
    />
  );
}
