import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { outboxApi } from '@/lib/api-client'

export async function GET(request: NextRequest) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const data = await outboxApi.getPending(jwt)
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
