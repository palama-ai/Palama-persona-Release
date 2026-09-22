import { NextResponse } from 'next/server'
import { resolveGatewayCaller, resolveOwnerId } from '@/lib/gateway'
import { getQuota } from '@/lib/token-usage'

/**
 * GET /api/usage/quota — weekly token quota for the caller.
 * Auth: Supabase session, sk-palama-... key, or engine with sb:<uid> owner.
 */
export async function GET(request: Request) {
  const caller = await resolveGatewayCaller(request)
  const userId = caller ? resolveOwnerId(caller) : null
  if (!userId) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 })
  }
  const quota = await getQuota(userId)
  return NextResponse.json(quota)
}
