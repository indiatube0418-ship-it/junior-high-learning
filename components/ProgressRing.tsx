interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
}

export function ProgressRing({ progress, size = 72 }: ProgressRingProps) {
  const strokeWidth = 6;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const progressNorm = Math.max(0, Math.min(100, progress)) / 100;
  const stroke = progressNorm * circ;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        className="w-full h-full -rotate-90 origin-center transition-all duration-1000"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          className="opacity-50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={circ - stroke}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[var(--fg)] drop-shadow-md pointer-events-none leading-none">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
