import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance — Sentinel" },
      { name: "description", content: "Framework compliance posture: NIST CSF, ISO 27001, CIS Controls, SOC 2." },
    ],
  }),
  component: CompliancePage,
});

const frameworks = [
  { name: "NIST CSF 2.0", coverage: 78, controls: { passed: 89, partial: 14, failed: 11 }, color: "success" },
  { name: "ISO 27001:2022", coverage: 71, controls: { passed: 82, partial: 19, failed: 13 }, color: "cyber" },
  { name: "CIS Controls v8", coverage: 65, controls: { passed: 117, partial: 28, failed: 35 }, color: "warning" },
  { name: "SOC 2 Type II", coverage: 84, controls: { passed: 64, partial: 8, failed: 4 }, color: "success" },
  { name: "PCI DSS 4.0", coverage: 58, controls: { passed: 142, partial: 41, failed: 67 }, color: "warning" },
  { name: "GDPR", coverage: 82, controls: { passed: 38, partial: 5, failed: 4 }, color: "success" },
];

function CompliancePage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-mono text-2xl font-bold">Compliance Posture</h1>
        <p className="text-sm text-muted-foreground mt-1">Continuous control monitoring across regulatory frameworks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {frameworks.map((f) => {
          const total = f.controls.passed + f.controls.partial + f.controls.failed;
          const colorVar = `var(--color-${f.color})`;
          return (
            <Card key={f.name} className="bg-gradient-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{f.name}</h3>
                <span className="font-mono text-2xl font-bold tabular-nums" style={{ color: colorVar, textShadow: `0 0 14px ${colorVar}` }}>
                  {f.coverage}%
                </span>
              </div>

              <div className="flex h-2 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full bg-success" style={{ width: `${(f.controls.passed / total) * 100}%`, boxShadow: "0 0 8px var(--color-success)" }} />
                <div className="h-full bg-warning" style={{ width: `${(f.controls.partial / total) * 100}%` }} />
                <div className="h-full bg-critical" style={{ width: `${(f.controls.failed / total) * 100}%` }} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success" /><span className="font-mono">{f.controls.passed}</span></div>
                <div className="flex items-center gap-1.5"><AlertCircle className="h-3 w-3 text-warning" /><span className="font-mono">{f.controls.partial}</span></div>
                <div className="flex items-center gap-1.5"><XCircle className="h-3 w-3 text-critical" /><span className="font-mono">{f.controls.failed}</span></div>
              </div>

              <div className="mt-3 flex justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <span>Passed</span><span>Partial</span><span>Failed</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
