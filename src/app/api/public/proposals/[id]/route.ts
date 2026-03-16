import { NextRequest, NextResponse } from 'next/server';
import { supabaseAnon } from '@/lib/supabase';
import { PublicProposalPatchSchema } from '@/lib/schemas';

// Public read — RLS enforces only sent/signed proposals are visible
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabaseAnon
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// Public PATCH — only allow status updates (viewed)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = PublicProposalPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabaseAnon
    .from('proposals')
    .update({ status: 'viewed' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
