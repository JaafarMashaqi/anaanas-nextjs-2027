import { callLaravel } from '@/lib/laravelClient'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const data = await callLaravel('/api/promotion/popup/click', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  return NextResponse.json(data)
}
