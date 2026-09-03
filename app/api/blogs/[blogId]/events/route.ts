import { NextRequest, NextResponse } from 'next/server'
import { callLaravel } from '@/lib/laravelClient'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ blogId: string }> },
) {
  const { blogId } = await context.params
  try {
    const body = await request.json()
    const response = await callLaravel(`/api/blogs/${blogId}/events`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to log event' },
      { status: 500 },
    )
  }
}
