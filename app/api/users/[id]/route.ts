import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { usersApi } from '@/lib/api-client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()
    const data = await usersApi.update(id, body, jwt)
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const { id } = await params
    await usersApi.delete(id, jwt)
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
