import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { outboxApi } from '@/lib/api-client'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const data = await outboxApi.getPending()
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
