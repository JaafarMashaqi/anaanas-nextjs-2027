import { callLaravel } from '@/lib/laravelClient'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const forward = new URLSearchParams()
  for (const key of ['country_id', 'client_id', 'land']) {
    const value = url.searchParams.get(key)
    if (value) forward.set(key, value)
  }
  const qs = forward.toString()
  const data = await callLaravel(`/api/promotion/popup${qs ? `?${qs}` : ''}`)
  return NextResponse.json(data)
}
