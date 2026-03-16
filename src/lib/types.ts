export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  type: string | null;
  material: string | null;
  setting: string | null;
  timeline: string | null;
  scope: string | null;
  zip: string | null;
  score: number;
  tier: 'URGENT' | 'WARM' | 'LOW';
  status: string;
  photos: string[] | null;
  source: string;
  estimated_value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  desc: string;
  qty: number;
  rate: number;
  total: number;
}

export interface Proposal {
  id: string;
  lead_id: string | null;
  proposal_number: string;
  client_name: string;
  client_company: string | null;
  client_email: string | null;
  scope_of_work: string | null;
  line_items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax: number;
  total: number;
  terms: string;
  status: string;
  signed_at: string | null;
  signed_by: string | null;
  signed_ip: string | null;
  signature_hash: string | null;
  ai_generated: boolean;
  generation_time_seconds: number | null;
  created_at: string;
}

export interface Job {
  id: string;
  proposal_id: string | null;
  lead_id: string | null;
  client_name: string;
  description: string | null;
  value: number | null;
  status: string;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  tagline: string;
  city: string;
  state: string;
  license_number: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  default_tax_rate: number;
}
