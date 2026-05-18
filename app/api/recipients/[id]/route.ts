import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { recipientsApi } from '@/lib/api-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const { id } = await params
    const data = await recipientsApi.getOne(id, jwt)
    return NextResponse.json(data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()
    const data = await recipientsApi.update(id, body, jwt)
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
    await recipientsApi.delete(id, jwt)
    return new NextResponse(null, { status: 204 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}