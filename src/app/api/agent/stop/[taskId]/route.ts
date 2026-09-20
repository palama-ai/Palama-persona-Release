import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params
  const agentUrl = process.env.PALAMA_AGENT_URL || 'http://localhost:8001'

  try {
    const agentResponse = await fetch(
      `${agentUrl}/api/v1/agent/stop/${taskId}`,
      { method: 'POST' }
    )

    if (!agentResponse.ok) {
      const errText = await agentResponse.text()
      return NextResponse.json(
        { error: errText },
        { status: agentResponse.status }
      )
    }

    const result = await agentResponse.json()
    return NextResponse.json(result)

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to stop agent' },
      { status: 500 }
    )
  }
}
