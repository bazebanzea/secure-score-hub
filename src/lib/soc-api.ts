import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Severity = "critical" | "high" | "medium" | "low";
export type DomainKey = "identity" | "network" | "endpoint" | "cloud" | "compliance";
export type VulnStatus = "open" | "patching" | "mitigated";

export interface Domain {
  key: DomainKey;
  label: string;
  score: number;
  weight: number;
  trend: number;
  controls_passed: number;
  controls_total: number;
}
export interface Asset {
  id: string;
  name: string;
  type: string;
  criticality: "tier-1" | "tier-2" | "tier-3";
  exposure: "internal" | "external";
  vulns: number;
  score: number;
  owner: string;
}
export interface Vulnerability {
  id: string;
  cve: string;
  title: string;
  severity: Severity;
  cvss: number;
  asset: string;
  domain: DomainKey;
  detected_at: string;
  status: VulnStatus;
  framework: string;
}
export interface Recommendation {
  id: string;
  title: string;
  domain: DomainKey;
  impact: number;
  effort: "low" | "medium" | "high";
  framework: string;
  description: string;
  applied: boolean;
}
export interface Snapshot { id: number; day: string; score: number }

export const useDomains = () =>
  useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const { data, error } = await supabase.from("domains").select("*").order("weight", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Domain[];
    },
  });

export const useAssets = () =>
  useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assets").select("*").order("score");
      if (error) throw error;
      return (data ?? []) as unknown as Asset[];
    },
  });

export const useVulnerabilities = () =>
  useQuery({
    queryKey: ["vulnerabilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vulnerabilities")
        .select("*")
        .order("cvss", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((v: any) => ({ ...v, cvss: Number(v.cvss) })) as Vulnerability[];
    },
  });

export const useRecommendations = () =>
  useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recommendations")
        .select("*")
        .order("impact", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Recommendation[];
    },
  });

export const useSnapshots = () =>
  useQuery({
    queryKey: ["snapshots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("score_snapshots")
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Snapshot[];
    },
  });

// --- Scoring engine ---
export function computeGlobalScore(domains: Domain[], vulns: Vulnerability[]): { score: number; penalty: boolean } {
  if (!domains.length) return { score: 0, penalty: false };
  const base = domains.reduce((acc, d) => acc + d.score * Number(d.weight), 0);
  // Critical penalty: any open critical CVE → -15%
  const penalty = vulns.some((v) => v.severity === "critical" && v.status === "open");
  return { score: Math.round(penalty ? base * 0.85 : base), penalty };
}

export function scoreColor(score: number) {
  if (score >= 800) return "success";
  if (score >= 600) return "cyber";
  if (score >= 400) return "warning";
  return "critical";
}
export function scoreLabel(score: number) {
  if (score >= 800) return "Strong";
  if (score >= 600) return "Moderate";
  if (score >= 400) return "At Risk";
  return "Critical";
}

// --- Mutations ---
export function useUpdateVulnStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: VulnStatus }) => {
      const { error } = await supabase.from("vulnerabilities").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vulnerabilities"] });
    },
  });
}

export function useApplyRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rec: Recommendation) => {
      // Mark applied
      const { error: e1 } = await supabase
        .from("recommendations")
        .update({ applied: !rec.applied })
        .eq("id", rec.id);
      if (e1) throw e1;

      if (!rec.applied) {
        // Bump domain score by impact (capped at 1000)
        const { data: dom } = await supabase.from("domains").select("score").eq("key", rec.domain).single();
        const newScore = Math.min(1000, (dom?.score ?? 0) + Math.round(rec.impact / 2));
        await supabase.from("domains").update({ score: newScore }).eq("key", rec.domain);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recommendations"] });
      qc.invalidateQueries({ queryKey: ["domains"] });
    },
  });
}
