import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { JobSchema } from '@/lib/schemas';

export async function GET() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = JobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const {
      id,
      proposal_id,
      lead_id,
      client_name,
      description,
      value,
      status,
      progress,
      start_date,
      due_date,
      notes,
    } = parsed.data;

    // Update existing job
    if (id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = {};
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (progress !== undefined) updateData.progress = progress;
      if (start_date !== undefined) updateData.start_date = start_date;
      if (due_date !== undefined) updateData.due_date = due_date;
      if (status === 'completed') updateData.completed_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    // Create new job — whitelist fields
    const insertData = {
      proposal_id: proposal_id || null,
      lead_id: lead_id || null,
      client_name: client_name || 'Unknown',
      description: description || null,
      value: value || null,
      status: status || 'scheduled',
      progress: progress || 0,
      start_date: start_date || null,
      due_date: due_date || null,
      notes: notes || null,
    };

    const { data, error } = await supabase
      .from('jobs')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
