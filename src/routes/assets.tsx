import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { assets, scoreColor } from "@/lib/mock-data";
import { Server, Laptop, Cloud, Shield, Network } from "lucide-react";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "Assets — Sentinel" },
      { name: "description", content: "Inventory of monitored assets and their security score." },
    ],
  }),
  component: AssetsPage,
});

const icons: Record<string, any> = { Server, Endpoint: Laptop, "Cloud Resource": Cloud, Identity: Shield, Network };

function AssetsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-mono text-2xl font-bold">Asset Estate</h1>
        <p className="text-sm text-muted-foreground mt-1">{assets.length} monitored assets · weighted by criticality tier</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {assets.map((a) => {
          const Icon = icons[a.type] || Server;
          const color = scoreColor(a.score);
          const colorVar = `var(--color-${color})`;
          return (
            <Card key={a.id} className="bg-gradient-panel p-5 hover:shadow-glow transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary/50">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-semibold">{a.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{a.type} · {a.owner}</p>
                  </div>
                </div>
                <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${a.criticality === "tier-1" ? "border-critical/40 text-critical" : a.criticality === "tier-2" ? "border-warning/40 text-warning" : "border-border text-muted-foreground"}`}>
                  {a.criticality}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Score</div>
                  <div className="font-mono text-3xl font-bold tabular-nums" style={{ color: colorVar, textShadow: `0 0 14px ${colorVar}` }}>{a.score}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Vulns</div>
                  <div className="font-mono text-xl font-bold tabular-nums text-warning">{a.vulns}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${a.exposure === "external" ? "bg-critical" : "bg-success"}`} />
                {a.exposure.toUpperCase()}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
