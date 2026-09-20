import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { removeContainer } from '@/lib/docker-manager'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch all machines for this user (to remove their Docker containers)
    const { data: machines } = await supabase
      .from('machines')
      .select('id')
      .eq('user_id', user.id)

    // 2. Remove Docker containers for each machine
    if (machines && machines.length > 0) {
      for (const machine of machines) {
        try {
          await removeContainer(machine.id)
          console.log(`[machines/clear] Removed container for machine ${machine.id}`)
        } catch (e) {
          console.warn(`[machines/clear] Could not remove container for ${machine.id}:`, e)
        }
      }
    }

    // 3. Delete all machines from database
    const { error: deleteError } = await supabase
      .from('machines')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'All machines and containers deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
