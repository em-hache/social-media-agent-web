import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'

const NODE_API = process.env.WHATSAPP_GW_URL!

export async function GET(request: NextRequest) {
  const { jwt, error } = await requireAuth(request)
  if (error) return error

  try {
    const res = await fetch(`${NODE_API}/qr`, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    })
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 })
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'Backend error' }, { status: res.status })
    }
    const contentType = res.headers.get('content-type') ?? 'image/png'
    const body = await res.arrayBuffer()
    return new NextResponse(body, {
      status: 200,
      headers: { 'Content-Type': contentType },
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Backend error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
