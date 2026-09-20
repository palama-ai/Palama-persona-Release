import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    // 1. Verify Internal API Key
    const incomingApiKey = request.headers.get('X-Internal-API-Key')
    const internalApiKey = process.env.INTERNAL_API_KEY || 'your_super_secret_key_here_for_palama_cloud'

    if (!incomingApiKey || incomingApiKey !== internalApiKey) {
      console.warn('Unauthorized webhook access attempt.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse Webhook payload
    const rawBody = await request.text()
    console.log('Raw Webhook Body received:', JSON.stringify(rawBody))
    
    if (!rawBody || rawBody.trim() === '') {
      console.warn('Webhook received empty body!')
      return NextResponse.json({ error: 'Empty body' }, { status: 400 })
    }

    let body
    try {
      body = JSON.parse(rawBody)
    } catch (parseError: any) {
      console.error('Failed to parse webhook JSON:', parseError.message, 'Raw body was:', rawBody)
      return NextResponse.json({ error: 'Invalid JSON', details: parseError.message }, { status: 400 })
    }
    
    const { machine_id, status, ip_address, container_id, error_message } = body

    if (!machine_id || !status) {
      return NextResponse.json({ error: 'Missing machine_id or status' }, { status: 400 })
    }

    console.log(`Received webhook for machine ${machine_id} with status ${status}`)

    // 3. Update database using Admin client to bypass RLS
    const supabase = await createAdminClient()

    const { error: updateError } = await supabase
      .from('machines')
      .update({
        status,
        ip_address: ip_address || null,
      })
      .eq('id', machine_id)

    if (updateError) {
      console.error('Failed to update machine in Supabase:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ received: true, machine_id, status })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
