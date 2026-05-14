import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { outboxApi } from '@/lib/api-client'
import type { OutboxStatus } from '@/lib/types'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    if (!phone) {
      return NextResponse.json({ error: 'phone is required' }, { status: 400 })
    }
    const status = searchParams.get('status') as OutboxStatus | null
    const data = await outboxApi.getByRecipient(phone, status ?? undefined)
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
