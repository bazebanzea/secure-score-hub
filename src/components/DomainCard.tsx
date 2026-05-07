import { Card } from "@/components/ui/card";
import { Domain, scoreColor } from "@/lib/mock-data";
import { ArrowDown, ArrowUp, Shield, Network, Laptop, Cloud, FileCheck } from "lucide-react";

const icons = { identity: Shield, network: Network, endpoint: Laptop, cloud: Cloud, compliance: FileCheck };

export function DomainCard({ d }: { d: Domain }) {
  const color = scoreColor(d.score);
  const colorVar = `var(--color-${color})`;
  const Icon = icons[d.key];
  const pct = (d.score / 1000) * 100;
  const ctrlPct = (d.controls.passed / d.controls.total) * 100;

  return (
    <Card className="group relative overflow-hidden bg-gradient-panel p-5 transition-all hover:shadow-glow">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary/50" style={{ color: colorVar }}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{d.label}</h3>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Weight {(d.weight * 100).toFixed(0)}%</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 font-mono text-xs ${d.trend >= 0 ? "text-success" : "text-critical"}`}>
          {d.trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(d.trend)}
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-mono text-4xl font-bold tabular-nums" style={{ color: colorVar, textShadow: `0 0 18px ${colorVar}` }}>{d.score}</span>
        <span className="font-mono text-xs text-muted-foreground">/ 1000</span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colorVar, boxShadow: `0 0 12px ${colorVar}` }} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">Controls</span>
        <span className="font-mono tabular-nums">{d.controls.passed}/{d.controls.total} ({ctrlPct.toFixed(0)}%)</span>
      </div>
    </Card>
  );
}
