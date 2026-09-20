import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * DELETE /api/account/delete — permanently delete the signed-in user's
 * Supabase account. Requires SUPABASE_SERVICE_ROLE_KEY (server-only env).
 */
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Account deletion is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Best-effort: ask the agent engine to forget this owner's data too.
    try {
      const agentUrl = (process.env.PALAMA_AGENT_URL || 'http://127.0.0.1:8391').replace(/\/+$/, '')
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      else if (process.env.INTERNAL_API_KEY) headers['Authorization'] = `Bearer ${process.env.INTERNAL_API_KEY.trim()}`
      await fetch(`${agentUrl}/api/v1/agent/memory/clear`, { method: 'POST', headers })
    } catch (e) {
      console.warn('Agent memory clear on delete failed:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Account delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
