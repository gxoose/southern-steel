import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

const SYSTEM_PROMPT = `You are a professional welding and fabrication estimator in San Antonio TX. Given the job description and photos, generate an itemized proposal. Include materials, labor hours at $75/hr, surface prep, finishing, and mobilization. Use realistic 2026 San Antonio market rates. Respond in JSON format: {"items": [{"desc": "string", "qty": number, "rate": number, "total": number}], "notes": "string"}. Respond ONLY with valid JSON — no markdown, no code fences, no extra text.`;

async function uploadPhotoToStorage(
  dataUrl: string,
  index: number,
  proposalId: string
): Promise<{ url: string; mediaType: string; base64: string } | null> {
  try {
    const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) return null;

    const mediaType = match[1];
    const base64Data = match[2];
    const ext = mediaType.split('/')[1].replace('+', '') || 'jpg';
    const filename = `${proposalId}/${index}.${ext}`;
    const buffer = Buffer.from(base64Data, 'base64');

    const { error } = await supabase.storage
      .from('proposal-photos')
      .upload(filename, buffer, {
        contentType: mediaType,
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error.message);
      // Return base64 fallback data so Claude can still analyze
      return { url: '', mediaType, base64: base64Data };
    }

    const { data: urlData } = supabase.storage
      .from('proposal-photos')
      .getPublicUrl(filename);

    return { url: urlData.publicUrl, mediaType, base64: base64Data };
  } catch (err) {
    console.error('Photo upload failed:', err);
    // Try to extract base64 for fallback
    const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) return { url: '', mediaType: match[1], base64: match[2] };
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_name, client_phone, client_email, notes, job_type, photos } = body;

    if (!client_name || !notes) {
      return NextResponse.json({ error: 'Client name and notes are required' }, { status: 400 });
    }

    const startTime = Date.now();
    const proposalTimestamp = Date.now().toString(36);

    // Upload photos to Supabase Storage
    const uploadedPhotos: { url: string; mediaType: string; base64: string }[] = [];
    if (photos && photos.length > 0) {
      const uploads = await Promise.all(
        photos.map((photo: string, i: number) =>
          uploadPhotoToStorage(photo, i, proposalTimestamp)
        )
      );
      for (const result of uploads) {
        if (result) uploadedPhotos.push(result);
      }
    }

    // Build content blocks for Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const contentBlocks: Anthropic.ContentBlockParam[] = [];

    // Add photos as image inputs — prefer URL, fall back to base64
    for (const photo of uploadedPhotos) {
      if (photo.url) {
        contentBlocks.push({
          type: 'image',
          source: {
            type: 'url',
            url: photo.url,
          },
        });
      } else {
        contentBlocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: photo.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: photo.base64,
          },
        });
      }
    }

    contentBlocks.push({
      type: 'text',
      text: `Job Type: ${job_type || 'General'}\n\nSite Visit Notes:\n${notes}\n\nGenerate a detailed itemized proposal.`,
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
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

    // Extract JSON from response (handle possible markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Support both formats: {items: [...]} and {line_items: [...]}
    const rawItems = parsed.items || parsed.line_items || [];
    const lineItems = rawItems.map((item: { desc?: string; description?: string; qty: number; rate: number; total: number }) => ({
      desc: item.desc || item.description || '',
      qty: item.qty,
      rate: item.rate,
      total: item.total,
    }));
    const scopeOfWork = parsed.notes || parsed.scope_of_work || notes;

    const subtotal = lineItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
    const taxRate = 0.0825;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    // Generate proposal number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true });
    const num = String((count || 0) + 1).padStart(4, '0');
    const proposalNumber = `SS-${year}-${num}`;

    // Collect Supabase Storage URLs for the record
    const photoUrls = uploadedPhotos.map((p) => p.url).filter(Boolean);

    // Save to Supabase
    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        proposal_number: proposalNumber,
        client_name,
        client_email: client_email || null,
        scope_of_work: scopeOfWork,
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

    return NextResponse.json({ ...proposal, photo_urls: photoUrls });
  } catch (err) {
    console.error('Generate proposal error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
