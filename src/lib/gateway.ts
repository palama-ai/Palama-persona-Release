import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { validateApiKey, logApiUsage } from '@/lib/api-keys'

export type GatewayCaller =
  | { kind: 'session'; userId: string }
  | { kind: 'api-key'; userId: string }
  | { kind: 'engine'; ownerId: string }
  | null;

/**
 * Resolve who is calling a gateway-proxy route:
 * 1. Supabase session (platform users),
 * 2. sk-palama-... API key (developers / desktop API-key mode),
 * 3. INTERNAL_API_KEY + X-Palama-Owner (desktop engine forwarding its task owner).
 */
export async function resolveGatewayCaller(request: Request): Promise<GatewayCaller> {
  const supabase = await createClient().catch(() => null)
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) return { kind: 'session', userId: user.id }
    } catch {}
  }

  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
  if (bearer) {
    const internalKey = (process.env.INTERNAL_API_KEY || '').trim()
    if (internalKey && bearer === internalKey) {
      const owner = (request.headers.get('x-palama-owner') || '').trim().slice(0, 128)
      if (owner) return { kind: 'engine', ownerId: owner }
      return null
    }
    const owner = await validateApiKey(bearer)
    if (owner) return { kind: 'api-key', userId: owner.userId }
    return null
  }
  return null
}

function gatewayConfig() {
  const base = (process.env.PALAMA_GATEWAY_URL || '').replace(/\/+$/, '')
  const key = (process.env.PALAMA_GATEWAY_API_KEY || '').trim()
  return { base, key }
}

/**
 * Forward a request to the upstream model gateway with the server-side key.
 * Returns a passthrough Response (status + body preserved).
 */
export async function forwardToGateway(
  path: string,
  init: { method?: string; body?: string; caller: Exclude<GatewayCaller, null> }
): Promise<Response> {
  const { base, key } = gatewayConfig()
  if (!base || !key) {
    return NextResponse.json(
      { error: 'Model gateway is not configured on the platform.' },
      { status: 503 }
    )
  }
  const ownerId =
    init.caller.kind === 'engine'
      ? init.caller.ownerId.replace(/^sb:/, '') // console reads rows by raw uid
      : init.caller.userId
  let loggedModel = ''
  try {
    const parsed = init.body ? JSON.parse(init.body) : null
    if (parsed && typeof parsed.model === 'string') loggedModel = parsed.model.slice(0, 120)
  } catch {}
  await logApiUsage(ownerId, `gateway:${path}`, loggedModel)
  const upstream = await fetch(`${base}${path}`, {
    method: init.method || 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: init.body,
  })
  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' },
  })
}
