import { callLaravel } from '@/lib/laravelClient'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const land = url.searchParams.get('land') ?? ''
  const qs = land ? `?land=${encodeURIComponent(land)}` : ''
  const data = await callLaravel(`/api/promotion/packages${qs}`)
  return NextResponse.json(data)
}
