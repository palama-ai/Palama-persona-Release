import { NextResponse } from 'next/server'
import { resolveGatewayCaller, forwardToGateway } from '@/lib/gateway'

/** GET /api/v1/models — OpenAI-shaped model catalog via Palama. */
export async function GET(request: Request) {
  const caller = await resolveGatewayCaller(request)
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return forwardToGateway('/models', { method: 'GET', caller })
}
