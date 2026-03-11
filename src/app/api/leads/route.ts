import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { scoreLead } from '@/lib/scoring';

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
    const { score, tier } = scoreLead({
      type: body.type,
      setting: body.setting,
      timeline: body.timeline,
      photos: body.photos,
    });

    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: body.name || 'Unknown',
        phone: body.phone || null,
        email: body.email || null,
        type: body.type || null,
        material: body.material || null,
        setting: body.setting || null,
        timeline: body.timeline || null,
        scope: body.scope || null,
        zip: body.zip || null,
        score,
        tier,
        status: 'new',
        photos: body.photos || null,
        source: body.source || 'chatbot',
        estimated_value: body.estimated_value || null,
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
