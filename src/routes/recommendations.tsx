import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useDomains, useRecommendations, useApplyRecommendation } from "@/lib/soc-api";
import { Lightbulb, Zap, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations — Sentinel" },
      { name: "description", content: "Prioritized remediation plan to improve security score." },
    ],
  }),
  component: RecoPage,
});

const effortColor: Record<string, string> = { low: "success", medium: "warning", high: "critical" };

function RecoPage() {
  const { data: recos = [], isLoading } = useRecommendations();
  const { data: domains = [] } = useDomains();
  const apply = useApplyRecommendation();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> <span className="font-mono text-xs">Loading…</span>
      </div>
    );
  }

  const remaining = recos.filter((r) => !r.applied);
  const totalGain = remaining.reduce((a, r) => a + r.impact, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold">Remediation Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-prioritized actions ranked by impact / effort ratio</p>
        </div>
        <Card className="bg-gradient-panel p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-cyber">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Potential Gain</div>
            <div className="font-mono text-2xl font-bold text-success text-glow">+{totalGain} pts</div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        {recos.map((r, i) => {
          const dom = domains.find((d) => d.key === r.domain);
          const eClr = effortColor[r.effort];
          return (
            <Card key={r.id} className={`bg-gradient-panel p-5 hover:border-primary/40 transition-all ${r.applied ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border font-mono text-sm ${r.applied ? "border-success/40 bg-success/10 text-success" : "border-primary/40 bg-primary/10 text-primary"}`}>
                  {r.applied ? <Check className="h-4 w-4" /> : String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase border-${eClr}/40 text-${eClr}`}>
                        {r.effort} effort
                      </span>
                      <span className={`font-mono font-bold ${r.applied ? "text-muted-foreground line-through" : "text-success text-glow"}`}>+{r.impact}</span>
                      <button
                        onClick={() =>
                          apply.mutate(r, {
                            onSuccess: () =>
                              toast.success(r.applied ? `${r.title} reverted` : `Applied: +${Math.round(r.impact / 2)} on ${dom?.label}`),
                          })
                        }
                        className={`rounded-md px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${r.applied ? "border border-border text-muted-foreground hover:border-primary/40" : "bg-primary text-primary-foreground hover:opacity-90"}`}
                      >
                        {r.applied ? "Revert" : "Apply"}
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                    <span className="rounded bg-secondary/60 px-2 py-0.5">{dom?.label}</span>
                    <span>·</span>
                    <span>{r.framework}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
