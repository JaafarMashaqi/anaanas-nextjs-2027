import { callLaravel } from '@/lib/laravelClient'
import { respondWithLaravelError } from '@/lib/api/respondWithLaravelError'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params
    const land = req.nextUrl.searchParams.get('land') || 'ar'
    const body = await req.json().catch(() => ({}))

    const data = await callLaravel(
      `/api/posts/${encodeURIComponent(postId)}/report?land=${encodeURIComponent(land)}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    )

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return respondWithLaravelError(error)
  }
}
