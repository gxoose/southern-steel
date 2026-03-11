import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_name, client_phone, client_email, notes, job_type, photos } = body;

    if (!client_name || !notes) {
      return NextResponse.json({ error: 'Client name and notes are required' }, { status: 400 });
    }

    const startTime = Date.now();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build content blocks for the message
    const contentBlocks: Anthropic.ContentBlockParam[] = [];

    // Add photos as vision input
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        if (photo.startsWith('data:image')) {
          const [meta, base64Data] = photo.split(',');
          const mediaTypeMatch = meta.match(/data:(image\/\w+)/);
          const mediaType = (mediaTypeMatch?.[1] || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
          contentBlocks.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data,
            },
          });
        }
      }
    }

    contentBlocks.push({
      type: 'text',
      text: `Job Type: ${job_type || 'General'}\n\nSite Visit Notes:\n${notes}\n\nGenerate a detailed proposal with line items.`,
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `You are a welding and fabrication estimator for Southern Steel, a welding company in San Antonio, TX. Given the job description and any photos, generate a detailed proposal with line items including description, quantity, rate, and total. Include materials, labor, surface prep, finishing, and mobilization as appropriate. Use realistic San Antonio TX market rates for 2024-2025.

Respond ONLY with valid JSON in this exact format:
{
  "scope_of_work": "A paragraph describing the full scope of work",
  "line_items": [
    {"desc": "Description of item", "qty": 1, "rate": 500, "total": 500}
  ]
}

Make sure all numbers are realistic. Labor rates should be $65-95/hr. Steel materials at market rates. Include mobilization/setup fee. Include surface prep and finishing where appropriate.`,
      messages: [
        {
          role: 'user',
          content: contentBlocks,
        },
      ],
    });

    const generationTime = (Date.now() - startTime) / 1000;

    // Parse Claude's response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const lineItems = parsed.line_items || [];
    const subtotal = lineItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
    const taxRate = 0.0825;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + tax;

    // Generate proposal number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true });
    const num = String((count || 0) + 1).padStart(4, '0');
    const proposalNumber = `SS-${year}-${num}`;

    // Save to Supabase
    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        proposal_number: proposalNumber,
        client_name,
        client_email: client_email || null,
        scope_of_work: parsed.scope_of_work || notes,
        line_items: lineItems,
        subtotal,
        tax_rate: taxRate,
        tax,
        total,
        ai_generated: true,
        generation_time_seconds: generationTime,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save proposal' }, { status: 500 });
    }

    return NextResponse.json(proposal);
  } catch (err) {
    console.error('Generate proposal error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
