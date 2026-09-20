import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { removeContainer } from '@/lib/docker-manager'

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

    // 2. Parse parameters
    const body = await request.json()
    const { machine_id } = body

    if (!machine_id) {
      return NextResponse.json({ error: 'Missing machine_id' }, { status: 400 })
    }

    // 3. Verify the machine belongs to this user
    const { data: machine, error: fetchError } = await supabase
      .from('machines')
      .select('*')
      .eq('id', machine_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    // 4. Remove the Docker container
    console.log(`[machines/delete] Removing container for machine ${machine_id}...`)
    const removed = await removeContainer(machine_id)

    if (!removed) {
      console.warn(`[machines/delete] Container for machine ${machine_id} may not exist (already deleted?)`)
    }

    // 5. Delete from database
    const { error: deleteError } = await supabase
      .from('machines')
      .delete()
      .eq('id', machine_id)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    console.log(`[machines/delete] Machine ${machine_id} deleted successfully`)

    return NextResponse.json({
      success: true,
      message: `Machine ${machine.name} deleted successfully`,
    })
  } catch (error: any) {
    console.error('Unexpected error deleting machine:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
