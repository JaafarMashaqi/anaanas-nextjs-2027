import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { callLaravel } from '@/lib/laravelClient'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  const data = await callLaravel('/api/promotion/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return NextResponse.json(data)
}
