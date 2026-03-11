import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // If updating an existing job (has id)
    if (body.id) {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          progress: body.progress,
          status: body.status,
          completed_at: body.status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', body.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    // Create new job
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        proposal_id: body.proposal_id || null,
        lead_id: body.lead_id || null,
        client_name: body.client_name,
        description: body.description || null,
        value: body.value || null,
        status: body.status || 'scheduled',
        progress: body.progress || 0,
        start_date: body.start_date || null,
        due_date: body.due_date || null,
        notes: body.notes || null,
      })
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
