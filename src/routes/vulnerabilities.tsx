import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { vulnerabilities } from "@/lib/mock-data";

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

function VulnsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-mono text-2xl font-bold">Vulnerability Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Mapped to NIST CSF · ISO 27001 · CIS Controls v8</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total CVEs", value: vulnerabilities.length, tone: "cyber" },
          { label: "Critical", value: vulnerabilities.filter((v) => v.severity === "critical").length, tone: "critical" },
          { label: "Open", value: vulnerabilities.filter((v) => v.status === "open").length, tone: "warning" },
          { label: "Mitigated", value: vulnerabilities.filter((v) => v.status === "mitigated").length, tone: "success" },
        ].map((k) => (
          <Card key={k.label} className="bg-gradient-panel p-4">
            <div className={`font-mono text-[10px] uppercase tracking-wider text-${k.tone}`}>{k.label}</div>
            <div className="font-mono text-3xl font-bold tabular-nums mt-1">{k.value}</div>
          </Card>
        ))}
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
              {vulnerabilities.map((v) => (
                <tr key={v.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3"><SeverityBadge severity={v.severity} /></td>
                  <td className="px-4 py-3 font-mono text-primary">{v.cve}</td>
                  <td className="px-4 py-3 max-w-md truncate">{v.title}</td>
                  <td className="px-4 py-3 font-mono text-xs">{v.asset}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{v.cvss.toFixed(1)}</td>
                  <td className={`px-4 py-3 font-mono text-xs uppercase ${statusColor[v.status]}`}>{v.status}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.detectedAt}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.framework}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
