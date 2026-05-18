import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { listsApi } from '@/lib/api-client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()
    await listsApi.addRecipient(id, body.recipient_id, jwt)
    return new NextResponse(null, { status: 204 })
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
    const body = await request.json()
    await listsApi.removeRecipient(id, body.recipient_id, jwt)
    return new NextResponse(null, { status: 204 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
