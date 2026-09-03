import { NextRequest, NextResponse } from 'next/server'
import { callLaravel } from '@/lib/laravelClient'
import { respondWithLaravelError } from '@/lib/api/respondWithLaravelError'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ blogId: string }> },
) {
  const { blogId } = await context.params
  const url = new URL(request.url)
  const page = url.searchParams.get('page') ?? '1'
  const perPage = url.searchParams.get('per_page') ?? '10'

  const response = await callLaravel(
    `/api/blogs/${blogId}/comments?page=${page}&per_page=${perPage}`,
    { method: 'GET' },
  )

  return NextResponse.json(response, { status: 200 })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ blogId: string }> },
) {
  const { blogId } = await context.params

  try {
    const body = await request.json()
    const response = await callLaravel(`/api/blogs/${blogId}/comments`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    return respondWithLaravelError(error)
  }
}
