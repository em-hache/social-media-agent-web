import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { outboxApi } from '@/lib/api-client'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    if (!start || !end) {
      return NextResponse.json({ error: 'start and end are required' }, { status: 400 })
    }
    const data = await outboxApi.getSent(start, end)
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
