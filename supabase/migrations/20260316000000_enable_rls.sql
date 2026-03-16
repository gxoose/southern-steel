-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can do everything (single-tenant for now)
CREATE POLICY "Authenticated users full access" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON proposals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON company_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public read for proposals (customer-facing /p/[id] page)
CREATE POLICY "Public can view sent/signed proposals" ON proposals FOR SELECT TO anon USING (status IN ('sent', 'signed', 'viewed'));

-- Public update for proposals (customer can mark as viewed or sign)
CREATE POLICY "Public can update sent proposals" ON proposals FOR UPDATE TO anon USING (status IN ('sent', 'signed', 'viewed')) WITH CHECK (status IN ('viewed', 'signed'));

-- Public insert for leads (chatbot intake)
CREATE POLICY "Public can create leads" ON leads FOR INSERT TO anon WITH CHECK (true);
