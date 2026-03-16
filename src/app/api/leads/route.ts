import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { scoreLead } from '@/lib/scoring';
import { LeadCreateSchema } from '@/lib/schemas';

export async function GET() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('score', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LeadCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;

    const { score, tier } = scoreLead({
      type: d.type,
      setting: d.setting,
      timeline: d.timeline,
      photos: d.photos,
    });

    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: d.name || 'Unknown',
        phone: d.phone || null,
        email: d.email || null,
        type: d.type || null,
        material: d.material || null,
        setting: d.setting || null,
        timeline: d.timeline || null,
        scope: d.scope || null,
        zip: d.zip || null,
        score,
        tier,
        status: 'new',
        photos: d.photos || null,
        source: d.source || 'chatbot',
        estimated_value: d.estimated_value || null,
        notes: d.notes || null,
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
