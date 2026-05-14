import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { usersApi } from '@/lib/api-client'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const data = await usersApi.createFromRecipient(body)
    return NextResponse.json(data, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
