import type { Severity } from "@/lib/soc-api";

const map: Record<Severity, { label: string; cls: string }> = {
  critical: { label: "CRITICAL", cls: "bg-critical/15 text-critical border-critical/40" },
  high: { label: "HIGH", cls: "bg-destructive/15 text-destructive border-destructive/40" },
  medium: { label: "MEDIUM", cls: "bg-warning/15 text-warning border-warning/40" },
  low: { label: "LOW", cls: "bg-muted text-muted-foreground border-border" },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const m = map[severity];
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider ${m.cls}`}>
      {m.label}
    </span>
  );
}
