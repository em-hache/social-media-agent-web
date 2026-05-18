import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { outboxApi } from '@/lib/api-client'
import type { OutboxStatus } from '@/lib/types'

export async function GET(request: NextRequest) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    if (!phone) {
      return NextResponse.json({ error: 'phone is required' }, { status: 400 })
    }
    const status = searchParams.get('status') as OutboxStatus | null
    const data = await outboxApi.getByRecipient(phone, status ?? undefined, jwt)
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
