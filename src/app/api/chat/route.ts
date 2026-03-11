import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 });
    }

    // Extract base64 data and media type from data URL
    const match = body.photo.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    const mediaType = match[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const imageData = match[2];

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData,
              },
            },
            {
              type: 'text',
              text: "You're a friendly welding and metal fabrication expert at Southern Steel in San Antonio, TX. A potential customer just sent this photo through our chat widget. In 1-2 short, conversational sentences, describe what you see — the type of metalwork, condition, what might need to be done. Be specific about the metal/welding aspects but keep it approachable. Don't use markdown, bullet points, or emojis.",
            },
          ],
        },
      ],
    });

    const reply =
      response.content[0].type === 'text'
        ? response.content[0].text
        : "Thanks for the photo! I can see the work area.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat photo analysis error:', err);
    // Return a graceful fallback instead of an error
    return NextResponse.json({
      reply: "Got the photo — thanks! Our team will take a closer look when we follow up.",
    });
  }
}
