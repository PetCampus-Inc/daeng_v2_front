import { NextResponse } from 'next/server';

type ClientErrorPayload = {
  kind?: string;
  message?: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  url?: string;
  userAgent?: string;
  timestamp?: string;
};

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const MAX_FIELD_LENGTH = 1000;

function truncate(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== 'string') return '';
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function createDiscordPayload(payload: ClientErrorPayload, request: Request) {
  const message = truncate(payload.message || 'Unknown client error', 250);
  const url = truncate(payload.url || request.headers.get('referer') || 'unknown', 500);
  const userAgent = truncate(payload.userAgent || request.headers.get('user-agent') || 'unknown', 500);
  const location =
    payload.source && payload.line
      ? `${payload.source}:${payload.line}${payload.column ? `:${payload.column}` : ''}`
      : payload.source;

  return {
    username: 'Knockdog Front Alert',
    embeds: [
      {
        title: `[Front Error] ${payload.kind || 'client_error'}`,
        description: message,
        color: 0xff4d4f,
        fields: [
          { name: 'URL', value: url, inline: false },
          { name: 'User Agent', value: userAgent, inline: false },
          ...(location ? [{ name: 'Location', value: truncate(location, 500), inline: false }] : []),
          ...(payload.stack
            ? [{ name: 'Stack', value: `\`\`\`\n${truncate(payload.stack)}\n\`\`\``, inline: false }]
            : []),
        ],
        timestamp: payload.timestamp || new Date().toISOString(),
      },
    ],
  };
}

export async function POST(request: Request) {
  if (!DISCORD_WEBHOOK_URL) {
    return NextResponse.json({ ok: true, skipped: 'DISCORD_WEBHOOK_URL is not configured' });
  }

  let payload: ClientErrorPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createDiscordPayload(payload, request)),
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: 'Discord webhook request failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to send Discord alert' }, { status: 502 });
  }
}
