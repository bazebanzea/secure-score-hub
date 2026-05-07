import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";
import {
  useVulnerabilities, useUpdateVulnStatus,
  type Severity, type VulnStatus,
} from "@/lib/soc-api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/vulnerabilities")({
  head: () => ({
    meta: [
      { title: "Vulnerabilities — Sentinel" },
      { name: "description", content: "Active CVEs detected across the asset estate." },
    ],
  }),
  component: VulnsPage,
});

const statusColor: Record<string, string> = {
  open: "text-critical",
  patching: "text-warning",
  mitigated: "text-success",
};

const STATUSES: VulnStatus[] = ["open", "patching", "mitigated"];
const SEVS: (Severity | "all")[] = ["all", "critical", "high", "medium", "low"];

function VulnsPage() {
  const { data: vulns = [], isLoading } = useVulnerabilities();
  const update = useUpdateVulnStatus();
  const [sev, setSev] = useState<Severity | "all">("all");
  const [q, setQ] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> <span className="font-mono text-xs">Loading CVEs…</span>
      </div>
    );
  }

  const filtered = vulns.filter((v) => {
    if (sev !== "all" && v.severity !== sev) return false;
    if (q && !`${v.cve} ${v.title} ${v.asset}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const cycleStatus = (current: VulnStatus): VulnStatus => {
    const i = STATUSES.indexOf(current);
    return STATUSES[(i + 1) % STATUSES.length];
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-mono text-2xl font-bold">Vulnerability Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Mapped to NIST CSF · ISO 27001 · CIS Controls v8 · click status to update</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total CVEs", value: vulns.length, tone: "cyber" },
          { label: "Critical", value: vulns.filter((v) => v.severity === "critical").length, tone: "critical" },
          { label: "Open", value: vulns.filter((v) => v.status === "open").length, tone: "warning" },
          { label: "Mitigated", value: vulns.filter((v) => v.status === "mitigated").length, tone: "success" },
        ].map((k) => (
          <Card key={k.label} className="bg-gradient-panel p-4">
            <div className={`font-mono text-[10px] uppercase tracking-wider text-${k.tone}`}>{k.label}</div>
            <div className="font-mono text-3xl font-bold tabular-nums mt-1">{k.value}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search CVE, title, asset…"
          className="rounded-md border border-border bg-background/40 px-3 py-1.5 text-sm font-mono w-64 focus:outline-none focus:border-primary"
        />
        <div className="flex gap-1">
          {SEVS.map((s) => (
            <button
              key={s}
              onClick={() => setSev(s)}
              className={`rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${sev === s ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-left">Severity</th>
                <th className="px-4 py-3 text-left">CVE</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Asset</th>
                <th className="px-4 py-3 text-left">CVSS</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Detected</th>
                <th className="px-4 py-3 text-left">Framework</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3"><SeverityBadge severity={v.severity} /></td>
                  <td className="px-4 py-3 font-mono text-primary">{v.cve}</td>
                  <td className="px-4 py-3 max-w-md truncate">{v.title}</td>
                  <td className="px-4 py-3 font-mono text-xs">{v.asset}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{v.cvss.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        const next = cycleStatus(v.status);
                        update.mutate(
                          { id: v.id, status: next },
                          { onSuccess: () => toast.success(`${v.cve} → ${next}`) },
                        );
                      }}
                      className={`font-mono text-xs uppercase ${statusColor[v.status]} hover:underline`}
                    >
                      {v.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.detected_at}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.framework}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground font-mono">No matching CVEs</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
