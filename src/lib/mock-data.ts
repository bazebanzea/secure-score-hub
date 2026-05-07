export type Severity = "critical" | "high" | "medium" | "low";
export type DomainKey = "identity" | "network" | "endpoint" | "cloud" | "compliance";

export interface Domain {
  key: DomainKey;
  label: string;
  score: number; // 0-1000
  weight: number; // 0-1
  trend: number; // delta last 7d
  controls: { passed: number; total: number };
}

export interface Vulnerability {
  id: string;
  cve: string;
  title: string;
  severity: Severity;
  cvss: number;
  asset: string;
  domain: DomainKey;
  detectedAt: string;
  status: "open" | "patching" | "mitigated";
  framework: string;
}

export interface Asset {
  id: string;
  name: string;
  type: "Server" | "Endpoint" | "Cloud Resource" | "Identity" | "Network";
  criticality: "tier-1" | "tier-2" | "tier-3";
  exposure: "internal" | "external";
  vulns: number;
  score: number;
  owner: string;
}

export interface Recommendation {
  id: string;
  title: string;
  domain: DomainKey;
  impact: number; // expected score gain
  effort: "low" | "medium" | "high";
  framework: string;
  description: string;
}

export const domains: Domain[] = [
  { key: "identity", label: "Identity & Access", score: 742, weight: 0.25, trend: +12, controls: { passed: 38, total: 52 } },
  { key: "network", label: "Network Security", score: 681, weight: 0.20, trend: -8, controls: { passed: 29, total: 44 } },
  { key: "endpoint", label: "Endpoint Protection", score: 814, weight: 0.20, trend: +5, controls: { passed: 47, total: 58 } },
  { key: "cloud", label: "Cloud Posture", score: 593, weight: 0.20, trend: -23, controls: { passed: 31, total: 60 } },
  { key: "compliance", label: "Compliance", score: 776, weight: 0.15, trend: +4, controls: { passed: 91, total: 120 } },
];

// Weighted average with critical penalty applied (Log4Shell unpatched: -30%)
export const criticalPenaltyActive = true;
const baseGlobal = domains.reduce((acc, d) => acc + d.score * d.weight, 0);
export const globalScore = Math.round(criticalPenaltyActive ? baseGlobal * 0.85 : baseGlobal);

export const vulnerabilities: Vulnerability[] = [
  { id: "V-1042", cve: "CVE-2021-44228", title: "Apache Log4j Remote Code Execution (Log4Shell)", severity: "critical", cvss: 10.0, asset: "prod-api-07", domain: "endpoint", detectedAt: "2026-05-02", status: "open", framework: "NIST CSF" },
  { id: "V-1041", cve: "CVE-2024-3094", title: "XZ Utils Backdoor", severity: "critical", cvss: 10.0, asset: "build-runner-02", domain: "endpoint", detectedAt: "2026-05-01", status: "patching", framework: "CIS Controls" },
  { id: "V-1039", cve: "CVE-2024-21413", title: "Outlook MonikerLink RCE", severity: "high", cvss: 9.8, asset: "corp-ws-fleet", domain: "identity", detectedAt: "2026-04-28", status: "open", framework: "ISO 27001" },
  { id: "V-1037", cve: "CVE-2023-23397", title: "Microsoft Outlook Privilege Escalation", severity: "high", cvss: 9.1, asset: "exchange-01", domain: "identity", detectedAt: "2026-04-25", status: "mitigated", framework: "NIST CSF" },
  { id: "V-1033", cve: "CVE-2024-6387", title: "OpenSSH regreSSHion", severity: "high", cvss: 8.1, asset: "edge-gw-cluster", domain: "network", detectedAt: "2026-04-22", status: "patching", framework: "CIS Controls" },
  { id: "V-1029", cve: "CVE-2024-23897", title: "Jenkins Arbitrary File Read", severity: "high", cvss: 9.8, asset: "ci-jenkins", domain: "cloud", detectedAt: "2026-04-19", status: "open", framework: "NIST CSF" },
  { id: "V-1024", cve: "CVE-2023-46604", title: "Apache ActiveMQ RCE", severity: "medium", cvss: 7.5, asset: "msg-broker-01", domain: "network", detectedAt: "2026-04-15", status: "open", framework: "ISO 27001" },
  { id: "V-1019", cve: "CVE-2024-1709", title: "ConnectWise ScreenConnect Auth Bypass", severity: "medium", cvss: 6.8, asset: "support-tools", domain: "identity", detectedAt: "2026-04-10", status: "mitigated", framework: "NIST CSF" },
  { id: "V-1014", cve: "CVE-2023-50164", title: "Apache Struts File Upload", severity: "low", cvss: 4.3, asset: "legacy-portal", domain: "cloud", detectedAt: "2026-04-05", status: "open", framework: "CIS Controls" },
];

export const assets: Asset[] = [
  { id: "A-01", name: "prod-api-07", type: "Server", criticality: "tier-1", exposure: "external", vulns: 3, score: 412, owner: "Platform Team" },
  { id: "A-02", name: "exchange-01", type: "Server", criticality: "tier-1", exposure: "external", vulns: 1, score: 681, owner: "IT Ops" },
  { id: "A-03", name: "corp-ws-fleet", type: "Endpoint", criticality: "tier-2", exposure: "internal", vulns: 12, score: 723, owner: "EDR Team" },
  { id: "A-04", name: "ci-jenkins", type: "Cloud Resource", criticality: "tier-1", exposure: "internal", vulns: 4, score: 502, owner: "DevSecOps" },
  { id: "A-05", name: "edge-gw-cluster", type: "Network", criticality: "tier-1", exposure: "external", vulns: 2, score: 615, owner: "NetSec" },
  { id: "A-06", name: "okta-tenant", type: "Identity", criticality: "tier-1", exposure: "external", vulns: 0, score: 892, owner: "IAM" },
  { id: "A-07", name: "aws-prod-account", type: "Cloud Resource", criticality: "tier-1", exposure: "external", vulns: 7, score: 548, owner: "Cloud Eng" },
  { id: "A-08", name: "msg-broker-01", type: "Server", criticality: "tier-2", exposure: "internal", vulns: 2, score: 644, owner: "Platform Team" },
];

export const recommendations: Recommendation[] = [
  { id: "R-01", title: "Patch Log4j on prod-api-07 immediately", domain: "endpoint", impact: 142, effort: "low", framework: "NIST CSF — PR.IP-12", description: "Critical RCE actively exploited. Upgrade log4j-core to 2.17.1+ across all JVM workloads. Removes the -15% global penalty." },
  { id: "R-02", title: "Enforce phishing-resistant MFA on Exchange", domain: "identity", impact: 58, effort: "medium", framework: "ISO 27001 — A.9.4.2", description: "Replace SMS/TOTP with FIDO2 passkeys for all privileged Exchange admins." },
  { id: "R-03", title: "Enable AWS GuardDuty across all 14 accounts", domain: "cloud", impact: 73, effort: "low", framework: "CIS AWS — 4.1", description: "Threat detection currently only in 6/14 accounts. Org-wide deployment via StackSets." },
  { id: "R-04", title: "Segment OT network from corporate VLAN", domain: "network", impact: 89, effort: "high", framework: "NIST CSF — PR.AC-5", description: "Lateral movement risk from corp endpoints to industrial controllers. Deploy microsegmentation." },
  { id: "R-05", title: "Rotate 47 stale service-account credentials", domain: "identity", impact: 34, effort: "low", framework: "CIS Controls — 5.4", description: "Credentials older than 365 days. Automate via Vault." },
  { id: "R-06", title: "Enable EDR tamper protection on workstation fleet", domain: "endpoint", impact: 41, effort: "low", framework: "CIS Controls — 10.5", description: "12% of endpoints allow local admin to disable EDR. Lock down policy." },
];

export const scoreTrend = [
  { day: "D-30", score: 612 },
  { day: "D-25", score: 634 },
  { day: "D-20", score: 658 },
  { day: "D-15", score: 671 },
  { day: "D-10", score: 689 },
  { day: "D-5", score: 702 },
  { day: "Today", score: globalScore },
];

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
