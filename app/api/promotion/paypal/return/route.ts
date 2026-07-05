import { callLaravel } from '@/lib/laravelClient'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const qs = url.searchParams.toString()
  const path = '/api/promotion/paypal/return' + (qs ? `?${qs}` : '')
  const data = await callLaravel(path)
  return NextResponse.json(data)
}
