import { z } from 'zod';

// POST /api/leads
export const LeadCreateSchema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  type: z.string().max(100).optional().nullable(),
  material: z.string().max(100).optional().nullable(),
  setting: z.string().max(500).optional().nullable(),
  scope: z.string().max(2000).optional().nullable(),
  photos: z.array(z.string()).max(10).optional().nullable(),
  timeline: z.string().max(200).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  estimated_value: z.number().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

// PATCH /api/leads/[id]
export const LeadUpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']).optional(),
  notes: z.string().max(5000).optional().nullable(),
  assigned_to: z.string().max(200).optional().nullable(),
  estimated_value: z.number().optional().nullable(),
});

// PATCH /api/proposals/[id]
const LineItemSchema = z.object({
  desc: z.string().max(500),
  qty: z.number().min(0),
  rate: z.number().min(0),
  total: z.number().min(0),
});

export const ProposalUpdateSchema = z.object({
  status: z.enum(['draft', 'sent', 'signed']).optional(),
  line_items: z.array(LineItemSchema).max(50).optional(),
  scope_of_work: z.string().max(10000).optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
  signed_by: z.string().max(200).optional(),
  signed_at: z.string().optional(),
});

// POST /api/proposals/[id]/sign & /api/public/proposals/[id]/sign
export const ProposalSignSchema = z.object({
  signed_by: z.string().max(200).optional(),
});

// POST /api/reprice
export const RepriceSchema = z.object({
  scope: z.string().max(10000),
  items: z.array(z.object({
    desc: z.string().max(500),
    qty: z.number(),
    rate: z.number(),
  })).min(1).max(50),
});

// POST /api/generate-proposal
export const GenerateProposalSchema = z.object({
  client_name: z.string().max(200),
  client_phone: z.string().max(20).optional().nullable(),
  client_email: z.string().email().optional().nullable(),
  notes: z.string().max(10000),
  job_type: z.string().max(100).optional().nullable(),
  photos: z.array(z.string()).max(10).optional().nullable(),
});

// POST /api/jobs
export const JobSchema = z.object({
  id: z.string().optional(),
  proposal_id: z.string().optional().nullable(),
  lead_id: z.string().optional().nullable(),
  client_name: z.string().max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  value: z.number().optional().nullable(),
  status: z.string().max(50).optional(),
  progress: z.number().min(0).max(100).optional(),
  start_date: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

// POST /api/chat
export const ChatPhotoSchema = z.object({
  photo: z.string(),
});

// PATCH /api/public/proposals/[id]
export const PublicProposalPatchSchema = z.object({
  status: z.literal('viewed'),
});
