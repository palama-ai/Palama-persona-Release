import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params

  const { searchParams } = new URL(request.url)
  const agentUrl = searchParams.get('control_url') || process.env.PALAMA_AGENT_URL || 'http://localhost:8001'

  try {
    // Proxy SSE stream from Agent Engine to browser
    const agentResponse = await fetch(
      `${agentUrl}/api/v1/agent/stream/${taskId}`,
      {
        headers: {
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${(process.env.INTERNAL_API_KEY || '').trim()}`
        },
        // @ts-ignore — needed for streaming
        cache: 'no-store',
      }
    )

    if (!agentResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Stream not found' }),
        { status: agentResponse.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a TransformStream to proxy the SSE
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const reader = agentResponse.body?.getReader()

    if (!reader) {
      return new Response(
        JSON.stringify({ error: 'No stream body' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Pipe in background
    ;(async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          await writer.write(value)
        }
      } catch {
        // Client disconnected or stream ended
      } finally {
        try { writer.close() } catch {}
      }
    })()

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to connect to agent stream' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
