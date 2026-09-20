import { NextResponse } from 'next/server'
import { resolveGatewayCaller, forwardToGateway } from '@/lib/gateway'

/** POST /api/images/generations — image generation via Palama. */
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
  return forwardToGateway('/images/generations', { method: 'POST', body, caller })
}
