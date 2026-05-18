import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { usersApi } from '@/lib/api-client'

export async function GET(request: NextRequest) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const data = await usersApi.getAll(jwt)
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function POST(request: Request) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const body = await request.json()
    const data = await usersApi.create(body, jwt)
    return NextResponse.json(data, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
