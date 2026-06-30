interface DataPoint {
  value: number; // 0–10
  date?: string;
  label?: string;
}

interface MoodSparklineProps {
  data: DataPoint[];
  height?: number;
  className?: string;
  showDots?: boolean;
  color?: string;
  gradient?: boolean;
}

function scoreToColor(score: number): string {
  if (score >= 7) return "var(--color-primary)";
  if (score >= 4) return "oklch(0.75 0.08 60)";
  return "var(--color-destructive)";
}

export function MoodSparkline({
  data,
  height = 48,
  className = "",
  showDots = true,
  color,
  gradient = true,
}: MoodSparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div
        className={`flex items-end gap-1 ${className}`}
        style={{ height }}
        aria-label="Mood chart — tidak cukup data"
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-cream-deep opacity-40"
            style={{ height: "30%" }}
          />
        ))}
      </div>
    );
  }

  const maxVal = 10;
  const minVal = 1;
  const range = maxVal - minVal;
  const w = 100;
  const padH = 4;
  const usableH = height - padH * 2;
  const stepX = w / (data.length - 1);

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = padH + usableH - ((d.value - minVal) / range) * usableH;
    return { x, y, value: d.value };
  });

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  // Smooth curve using Catmull-Rom-like control points
  const smoothD = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const areaPath = `${smoothD} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className={`w-full overflow-visible ${className}`}
      style={{ height }}
      aria-label={`Mood sparkline, ${data.length} data points`}
    >
      <defs>
        {gradient && (
          <linearGradient id="mood-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color ?? "var(--color-primary)"} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color ?? "var(--color-primary)"} stopOpacity="0.02" />
          </linearGradient>
        )}
      </defs>

      {/* Area fill */}
      {gradient && (
        <path d={areaPath} fill="url(#mood-gradient)" />
      )}

      {/* Line */}
      <path
        d={smoothD}
        fill="none"
        stroke={color ?? "var(--color-primary)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Dots */}
      {showDots &&
        points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.5"
            fill={color ?? scoreToColor(p.value)}
            stroke="white"
            strokeWidth="1.5"
          />
        ))}
    </svg>
  );
}

/** Simple bar sparkline variant */
export function MoodBars({
  data,
  height = 36,
  className = "",
}: {
  data: DataPoint[];
  height?: number;
  className?: string;
}) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-end gap-1 ${className}`} style={{ height }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-cream-deep" style={{ height: "20%" }} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-end gap-1 ${className}`}
      style={{ height }}
      aria-label="Mood bar chart"
    >
      {data.map((d, i) => (
        <div
          key={i}
          title={d.label ?? `Score: ${d.value}/10`}
          className="flex-1 rounded-t-sm transition-all duration-500"
          style={{
            height: `${Math.max(8, (d.value / 10) * 100)}%`,
            background: scoreToColor(d.value),
            opacity: 0.5 + (d.value / 10) * 0.5,
          }}
        />
      ))}
    </div>
  );
}
