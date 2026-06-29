// Circular score ring (shared by the dashboard home + AI-score page).
export function Ring({
  value,
  size = 84,
  stroke = 9,
  trackColor = "var(--color-gray-100)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  trackColor?: string;
}) {
  const r = size / 2 - stroke / 2 - 1;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-primary-500)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold leading-none text-gray-900"
          style={{ fontSize: size * 0.29 }}
        >
          {value}
        </span>
        <span className="text-gray-400" style={{ fontSize: size * 0.12 }}>
          / 100
        </span>
      </div>
    </div>
  );
}
