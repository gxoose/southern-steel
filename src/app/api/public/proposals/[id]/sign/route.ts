import { NextRequest, NextResponse } from 'next/server';
import { supabaseAnon } from '@/lib/supabase';

// Public signing endpoint — customers can sign proposals sent to them
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabaseAnon
    .from('proposals')
    .update({
      status: 'signed',
      signed_at: new Date().toISOString(),
      signed_by: body.signed_by || 'Client',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
