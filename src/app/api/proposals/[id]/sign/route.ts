import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabase } from '@/lib/supabase';
import { ProposalSignSchema } from '@/lib/schemas';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = ProposalSignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const signed_by = parsed.data.signed_by || 'Client';
  const signed_at = new Date().toISOString();
  const signed_ip = req.headers.get('x-forwarded-for') ?? 'unknown';

  const secret = process.env.SIGNING_SECRET || '';
  const signature_hash = createHmac('sha256', secret)
    .update(`${id}${signed_by}${signed_at}`)
    .digest('hex');

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'signed',
      signed_at,
      signed_by,
      signed_ip,
      signature_hash,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
