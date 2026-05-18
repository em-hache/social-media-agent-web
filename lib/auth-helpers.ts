import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET!
const JWT_ALGORITHM = 'HS256'

function generateBackendJWT(session: { sub?: string; email?: string; role?: string }): string {
  if (!session.sub) {
    throw new Error('Session missing user ID (sub)')
  }

  const payload = {
    sub: session.sub,
    email: session.email,
    role: session.role,
  }

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM as jwt.Algorithm,
    expiresIn: '30d',
  })
}

export async function getJWT(req: NextRequest | Request): Promise<string | null> {
  // Get NextAuth session token (decoded)
  const token = await getToken({ req: req as any })

  if (!token) {
    return null
  }

  try {
    return generateBackendJWT({
      sub: token.sub,
      email: token.email as string | undefined,
      role: token.role as string | undefined,
    })
  } catch (error) {
    console.error('Failed to generate backend JWT:', error)
    return null
  }
}

export async function requireAuth(req: NextRequest | Request): Promise<
  { jwt: string; error: null } | { jwt: null; error: NextResponse }
> {
  const jwtToken = await getJWT(req)
  if (!jwtToken) {
    return {
      jwt: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { jwt: jwtToken, error: null }
}
