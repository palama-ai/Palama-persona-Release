import { NextResponse } from 'next/server'
import { validateApiKey } from '@/lib/api-keys'

/**
 * GET /api/keys/whoami — validate a Palama API key.
 * Used by Palama Co-Worker (desktop login with API key).
 * Header: Authorization: Bearer sk-palama-...
 * Returns { ok: true } or 401. Never reveals anything else.
 */
export async function GET(request: Request) {
  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  const owner = await validateApiKey(bearer)
  if (!owner) {
    return NextResponse.json({ ok: false, error: 'Invalid API key' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
