import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status, line_items, scope_of_work, subtotal, tax, total, signed_by, signed_at } =
    await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};
  if (status !== undefined) updateData.status = status;
  if (line_items !== undefined) updateData.line_items = line_items;
  if (scope_of_work !== undefined) updateData.scope_of_work = scope_of_work;
  if (subtotal !== undefined) updateData.subtotal = subtotal;
  if (tax !== undefined) updateData.tax = tax;
  if (total !== undefined) updateData.total = total;
  if (signed_by !== undefined) updateData.signed_by = signed_by;
  if (signed_at !== undefined) updateData.signed_at = signed_at;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('proposals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
