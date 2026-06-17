export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M12 21c0-5 3-9 8-10-2 6-5 9-8 10Zm0 0c0-5-3-9-8-10 2 6 5 9 8 10Zm0 0V9m0 0c1.5-2 4-3 6-3-1 3-3 5-6 5Zm0 0C10.5 7 8 6 6 6c1 3 3 5 6 5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">
        Bloom <span className="text-primary">Mind</span>
      </span>
    </div>
  );
}
