import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { usersApi } from '@/lib/api-client'

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const data = await usersApi.deactivate(id)
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
