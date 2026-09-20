import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  createContainer,
  waitForAgentHealth,
} from '@/lib/docker-manager'

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
    const { name, os, tier, cpu_cores, memory_gb, restore } = body

    if (!name || !os || !tier) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 3. Create the machine entry in database with status 'creating'
    const { data: machineData, error: dbError } = await supabase
      .from('machines')
      .insert({
        user_id: user.id,
        name,
        os,
        tier,
        status: 'creating',
        cpu_cores: cpu_cores || 2,
        memory_gb: memory_gb || 4,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database Error:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // 4. Create a real Docker container
    try {
      console.log(`[machines/create] Creating Docker container for machine ${machineData.id}...`)

      const containerInfo = await createContainer(
        machineData.id,
        name,
        cpu_cores || 2,
        memory_gb || 4
      )

      console.log(`[machines/create] Container created: ${containerInfo.containerName}`)
      console.log(`[machines/create] Agent: ${containerInfo.agentUrl}, VNC: ${containerInfo.vncUrl}`)

      // 5. Wait for the agent inside the container to become healthy (max 60s)
      const healthy = await waitForAgentHealth(containerInfo.agentUrl, 30, 2000)

      const finalStatus = healthy ? 'ready' : 'error'

      // 6. Update machine in database with real container info
      const { error: updateError } = await supabase
        .from('machines')
        .update({
          status: finalStatus,
          control_url: containerInfo.agentUrl,
          vnc_url: containerInfo.vncUrl,
          ip_address: containerInfo.vncUrl,
        })
        .eq('id', machineData.id)

      if (updateError) {
        console.error('Failed to update machine after container creation:', updateError)
      }

      const readyMachine = {
        ...machineData,
        status: finalStatus,
        control_url: containerInfo.agentUrl,
        vnc_url: containerInfo.vncUrl,
        ip_address: containerInfo.vncUrl,
      }

      return NextResponse.json(readyMachine)
    } catch (dockerError: any) {
      console.error('[machines/create] Docker container creation failed:', dockerError.message)

      // Update status to error in DB
      await supabase
        .from('machines')
        .update({ status: 'error' })
        .eq('id', machineData.id)

      return NextResponse.json(
        { error: 'Failed to create Docker container', details: dockerError.message },
        { status: 503 }
      )
    }
  } catch (error: any) {
    console.error('Unexpected error creating machine:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
