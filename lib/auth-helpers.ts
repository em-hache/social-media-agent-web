import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Gets the JWT token from the request and returns it as a string.
 * If no token exists, returns null.
 */
export async function getJWT(req: NextRequest | Request): Promise<string | null> {
  // Cast to any to avoid type errors with getToken
  const jwt = await getToken({ req: req as any, raw: true })
  return jwt
}

/**
 * Gets the JWT token and returns an unauthorized response if not found.
 * Use this at the start of API routes to validate authentication.
 */
export async function requireAuth(req: NextRequest | Request): Promise<
  { jwt: string; error: null } | { jwt: null; error: NextResponse }
> {
  const jwt = await getJWT(req)
  if (!jwt) {
    return {
      jwt: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { jwt, error: null }
}
