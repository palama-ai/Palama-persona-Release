import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { validateApiKey, logApiUsage } from '@/lib/api-keys'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Session auth first, Palama API key second (sk-palama-...)
    let keyOwnerId: string | null = null
    if (authError || !user) {
      const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim()
      const owner = await validateApiKey(bearer)
      if (!owner) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      keyOwnerId = owner.userId
    }
    const ownerId = user?.id || keyOwnerId || 'unknown'

    const body = await request.json()
    const { task, model, executionMode, execution_mode, sandbox_url, max_steps, control_url } = body

    const usedModel = typeof body.model === 'string' && body.model ? body.model : 'auto'
    await logApiUsage(ownerId, 'agent.run', usedModel)

    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 })
    }

    const rawMode = executionMode || execution_mode || model || 'BASIC'
    const modeUpper = String(rawMode).toUpperCase()

    // Validate executionMode strictly
    if (!['BASIC', 'COMPLEX', 'AUTO'].includes(modeUpper)) {
      return NextResponse.json(
        { error: 'Invalid executionMode. Must be BASIC or COMPLEX' },
        { status: 400 }
      )
    }

    // Forward to Agent Engine
    const agentUrl = control_url || process.env.PALAMA_AGENT_URL || 'http://localhost:8001'

    const agentResponse = await fetch(`${agentUrl}/api/v1/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(process.env.INTERNAL_API_KEY || '').trim()}`
      },
      body: JSON.stringify({
        task: task.trim(),
        model: modeUpper.toLowerCase(),
        execution_mode: modeUpper,
        executionMode: modeUpper,
        sandbox_url: sandbox_url || undefined,
        max_steps: max_steps || 50,
      }),
    })

    if (!agentResponse.ok) {
      const errText = await agentResponse.text()
      return NextResponse.json(
        { error: `Agent engine error: ${errText}` },
        { status: agentResponse.status }
      )
    }

    const result = await agentResponse.json()
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Agent run error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
