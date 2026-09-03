import { callLaravel } from '@/lib/laravelClient'
import { respondWithLaravelError } from '@/lib/api/respondWithLaravelError'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await callLaravel('/api/platform/public-settings', { method: 'GET' })
    return NextResponse.json(data)
  } catch (error) {
    return respondWithLaravelError(error)
  }
}
