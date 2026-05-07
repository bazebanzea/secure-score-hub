
-- Domains
CREATE TABLE public.domains (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  score INT NOT NULL,
  weight NUMERIC(4,3) NOT NULL,
  trend INT NOT NULL DEFAULT 0,
  controls_passed INT NOT NULL DEFAULT 0,
  controls_total INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  criticality TEXT NOT NULL,
  exposure TEXT NOT NULL,
  vulns INT NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 0,
  owner TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vulnerabilities (
  id TEXT PRIMARY KEY,
  cve TEXT NOT NULL,
  title TEXT NOT NULL,
  severity TEXT NOT NULL,
  cvss NUMERIC(3,1) NOT NULL,
  asset TEXT NOT NULL,
  domain TEXT NOT NULL REFERENCES public.domains(key),
  detected_at DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  framework TEXT NOT NULL
);

CREATE TABLE public.recommendations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  domain TEXT NOT NULL REFERENCES public.domains(key),
  impact INT NOT NULL,
  effort TEXT NOT NULL,
  framework TEXT NOT NULL,
  description TEXT NOT NULL,
  applied BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE public.score_snapshots (
  id BIGSERIAL PRIMARY KEY,
  day TEXT NOT NULL,
  score INT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_snapshots ENABLE ROW LEVEL SECURITY;

-- Demo SOC: public read + public mutation (no auth in demo)
CREATE POLICY "demo all" ON public.domains FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo all" ON public.assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo all" ON public.vulnerabilities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo all" ON public.recommendations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo all" ON public.score_snapshots FOR ALL USING (true) WITH CHECK (true);
