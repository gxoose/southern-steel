import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { RepriceSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { limited } = await checkRateLimit(`reprice:${ip}`, 10, 60);
  if (limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = RepriceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { scope, items } = parsed.data;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const itemList = items
      .map((item: { desc: string; qty: number; rate: number }, i: number) =>
        `${i + 1}. "${item.desc}" — current qty: ${item.qty}, current rate: $${item.rate}`
      )
      .join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `You are a professional welding and fabrication estimator in San Antonio, TX. You are reviewing an existing proposal's line items and need to suggest updated quantities and rates based on current 2026 San Antonio market pricing. Labor rate is $75/hr. Use realistic material costs and industry-standard estimates. Keep descriptions exactly as provided — only update qty and rate values. Respond ONLY with valid JSON, no markdown or code fences.`,
      messages: [
        {
          role: 'user',
          content: `Here is the scope of work:\n${scope || 'General welding and fabrication'}\n\nHere are the current line items:\n${itemList}\n\nReturn updated pricing as JSON in this exact format:\n{"items": [{"desc": "exact original description", "qty": number, "rate": number, "total": number}]}`,
        },
      ],
    });

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const aiResult = JSON.parse(jsonMatch[0]);
    const updatedItems = (aiResult.items || aiResult.line_items || []).map(
      (item: { desc?: string; description?: string; qty: number; rate: number; total?: number }) => ({
        desc: item.desc || item.description || '',
        qty: item.qty,
        rate: item.rate,
        total: item.total ?? Math.round(item.qty * item.rate * 100) / 100,
      })
    );

    return NextResponse.json({ items: updatedItems });
  } catch (err) {
    console.error('Reprice error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
