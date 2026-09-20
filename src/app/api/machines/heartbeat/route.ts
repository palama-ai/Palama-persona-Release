import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request parameters
    const body = await request.json()
    const { machine_id } = body

    if (!machine_id) {
      return NextResponse.json({ error: 'Missing machine_id' }, { status: 400 })
    }

    // 3. Send heartbeat to Python orchestrator
    const orchestratorUrl = process.env.PALAMA_INFRA_ORCHESTRATOR_URL || 'http://localhost:8000'
    const internalApiKey = process.env.INTERNAL_API_KEY || 'your_super_secret_key_here_for_palama_cloud'

    try {
      const response = await fetch(`${orchestratorUrl}/api/v1/machines/${machine_id}/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-API-Key': internalApiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Orchestrator returned ${response.status}`)
      }

      const resData = await response.json()
      return NextResponse.json(resData)
    } catch (fetchError) {
      // Local development fallback
      return NextResponse.json({ success: true, status: 'alive' })
    }
  } catch (error: any) {
    console.error('Unexpected error in heartbeat route:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
