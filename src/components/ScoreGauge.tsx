import { scoreColor, scoreLabel } from "@/lib/soc-api";

interface Props {
  score: number;
  max?: number;
  size?: number;
  label?: string;
  penalty?: boolean;
}

export function ScoreGauge({ score, max = 1000, size = 240, label, penalty }: Props) {
  const pct = Math.min(score / max, 1);
  const radius = size / 2 - 14;
  const circ = 2 * Math.PI * radius;
  const dash = circ * pct;
  const color = scoreColor(score);
  const colorVar = `var(--color-${color})`;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--color-border)" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={colorVar} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ filter: `drop-shadow(0 0 8px ${colorVar})`, transition: "stroke-dasharray 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">{label ?? "Global Score"}</span>
        <span className="font-mono text-5xl font-bold tabular-nums text-glow" style={{ color: colorVar }}>{score}</span>
        <span className="font-mono text-xs text-muted-foreground">/ {max}</span>
        <span className="mt-2 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: `color-mix(in oklab, ${colorVar} 18%, transparent)`, color: colorVar }}>
          {scoreLabel(score)}
        </span>
        {penalty && (
          <span className="mt-1 font-mono text-[9px] text-critical">⚠ -15% PENALTY ACTIVE</span>
        )}
      </div>
    </div>
  );
}
