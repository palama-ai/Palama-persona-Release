import { NextResponse } from 'next/server'
import { resolveGatewayCaller, forwardToGateway } from '@/lib/gateway'

/**
 * POST /api/v1/chat/completions — OpenAI-compatible chat via Palama.
 * Auth: Supabase session, sk-palama-... key, or engine (INTERNAL + owner).
 * Only these identities work; the upstream gateway key never leaves the server.
 */

// Code generations take minutes — allow long execution (Vercel: needs Pro+).
export const maxDuration = 300;
export async function POST(request: Request) {
  const caller = await resolveGatewayCaller(request)
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body = ''
  try {
    body = JSON.stringify(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  return forwardToGateway('/chat/completions', { method: 'POST', body, caller })
}
