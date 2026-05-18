import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { usersApi } from '@/lib/api-client'

export async function POST(request: Request) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const data = await usersApi.createFromRecipient(body, jwt)
    return NextResponse.json(data, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
