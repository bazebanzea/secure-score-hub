import { createFileRoute, Link } from "@tanstack/react-router";
import { ScoreGauge } from "@/components/ScoreGauge";
import { DomainCard } from "@/components/DomainCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Card } from "@/components/ui/card";
import { Activity, AlertTriangle, ShieldCheck, TrendingUp, Loader2 } from "lucide-react";
import {
  useDomains, useVulnerabilities, useRecommendations, useSnapshots,
  computeGlobalScore,
} from "@/lib/soc-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOC Overview — Sentinel" },
      { name: "description", content: "Real-time security posture overview." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const domainsQ = useDomains();
  const vulnsQ = useVulnerabilities();
  const recoQ = useRecommendations();
  const snapsQ = useSnapshots();

  if (domainsQ.isLoading || vulnsQ.isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> <span className="font-mono text-xs">Aggregating telemetry…</span>
      </div>
    );
  }

  const domains = domainsQ.data ?? [];
  const vulns = vulnsQ.data ?? [];
  const recos = recoQ.data ?? [];
  const snaps = snapsQ.data ?? [];

  const { score: globalScore, penalty } = computeGlobalScore(domains, vulns);
  const open = vulns.filter((v) => v.status === "open").length;
  const critical = vulns.filter((v) => v.severity === "critical").length;

  // Rebuild trend with computed live score as "Today"
  const trend = snaps.length
    ? [...snaps.slice(0, -1), { id: -1, day: "Today", score: globalScore }]
    : [{ id: -1, day: "Today", score: globalScore }];
  const max = Math.max(...trend.map((s) => s.score));
  const min = Math.min(...trend.map((s) => s.score));
  const first = trend[0]?.score ?? globalScore;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Security Operations Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-mono">Live · Lovable Cloud</span> · {domains.length} domains · NIST CSF · ISO 27001 · CIS v8
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-muted-foreground uppercase tracking-wider">All collectors operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-gradient-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
          </div>
          <ScoreGauge score={globalScore} penalty={penalty} />
          <div className="mt-4 grid grid-cols-3 gap-3 w-full">
            <Stat icon={AlertTriangle} label="Critical" value={critical} tone="critical" />
            <Stat icon={Activity} label="Open" value={open} tone="warning" />
            <Stat icon={ShieldCheck} label="Domains" value={domains.length} tone="cyber" />
          </div>
        </Card>

        <Card className="lg:col-span-2 bg-gradient-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Score Trend · 30 days</h2>
              <p className="text-xs text-muted-foreground font-mono mt-1">Weighted average across all domains</p>
            </div>
            <div className={`flex items-center gap-2 font-mono text-xs ${globalScore >= first ? "text-success" : "text-critical"}`}>
              <TrendingUp className="h-3 w-3" />
              {globalScore >= first ? "+" : ""}{globalScore - first}
            </div>
          </div>
          <TrendChart data={trend} max={max} min={min} />
        </Card>
      </div>

      <div>
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Domain Scoring · Weighted</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {domains.map((d) => (
            <DomainCard
              key={d.key}
              d={{
                key: d.key,
                label: d.label,
                score: d.score,
                weight: Number(d.weight),
                trend: d.trend,
                controls: { passed: d.controls_passed, total: d.controls_total },
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Critical Vulnerabilities</h2>
            <Link to="/vulnerabilities" className="font-mono text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {vulns.slice(0, 5).map((v) => (
              <div key={v.id} className="flex items-center gap-3 rounded-md border border-border bg-background/40 p-3 hover:border-primary/40 transition-colors">
                <SeverityBadge severity={v.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-primary">{v.cve}</span>
                    <span className="text-xs text-muted-foreground truncate">{v.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground font-mono">
                    <span>{v.asset}</span><span>·</span><span>CVSS {v.cvss.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Top Recommendations</h2>
            <Link to="/recommendations" className="font-mono text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {recos.slice(0, 5).map((r) => (
              <div key={r.id} className="rounded-md border border-border bg-background/40 p-3 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm">{r.title}</p>
                  <span className={`font-mono text-xs whitespace-nowrap ${r.applied ? "text-muted-foreground line-through" : "text-success"}`}>+{r.impact}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <span className="uppercase">{r.effort} effort</span><span>·</span><span>{r.framework}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-3 py-2">
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-${tone} font-mono`}>
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-0.5 font-mono text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function TrendChart({ data, max, min }: { data: { day: string; score: number }[]; max: number; min: number }) {
  const W = 600, H = 180, pad = 20;
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = pad + (i * (W - pad * 2)) / Math.max(1, data.length - 1);
    const y = H - pad - ((d.score - min) / range) * (H - pad * 2);
    return { x, y, ...d };
  });
  const path = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${H - pad} L ${pad} ${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-cyber)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-cyber)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={pad} x2={W - pad} y1={pad + p * (H - pad * 2)} y2={pad + p * (H - pad * 2)} stroke="var(--color-border)" strokeDasharray="2 4" />
      ))}
      <path d={area} fill="url(#g)" />
      <path d={path} fill="none" stroke="var(--color-cyber)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 6px var(--color-cyber))" }} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="var(--color-cyber)" />
          <text x={p.x} y={H - 4} textAnchor="middle" className="font-mono" fill="var(--color-muted-foreground)" fontSize="9">{p.day}</text>
        </g>
      ))}
    </svg>
  );
}
