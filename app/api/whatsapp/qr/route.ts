import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const NODE_API = process.env.NODE_API_URL!

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const res = await fetch(`${NODE_API}/qr`)
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
