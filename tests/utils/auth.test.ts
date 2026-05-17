/**
 * @jest-environment node
 */

// Mock the CredentialsProvider factory so we can inspect the authorize callback
jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: (config: any) => ({ ...config, id: 'credentials', type: 'credentials' }),
}))

import { authOptions } from '@/lib/auth'

describe('authOptions', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ADMIN_USERNAME: 'testadmin',
      ADMIN_PASSWORD: 'testpassword123',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses JWT session strategy', () => {
    expect(authOptions.session?.strategy).toBe('jwt')
  })

  it('has sign-in page configured as /login', () => {
    expect(authOptions.pages?.signIn).toBe('/login')
  })

  it('configures exactly one credentials provider', () => {
    expect(authOptions.providers).toHaveLength(1)
    expect((authOptions.providers[0] as any).type).toBe('credentials')
  })

  describe('authorize', () => {
    let authorize: (credentials: any) => Promise<any>

    beforeAll(() => {
      authorize = (authOptions.providers[0] as any).authorize
    })

    it('returns a user object for valid credentials', async () => {
      const result = await authorize({
        username: 'testadmin',
        password: 'testpassword123',
      })
      expect(result).toEqual({ id: '1', name: 'Admin' })
    })

    it('returns null for wrong username', async () => {
      const result = await authorize({
        username: 'wronguser',
        password: 'testpassword123',
      })
      expect(result).toBeNull()
    })

    it('returns null for wrong password', async () => {
      const result = await authorize({
        username: 'testadmin',
        password: 'wrongpassword',
      })
      expect(result).toBeNull()
    })

    it('returns null when credentials are undefined', async () => {
      const result = await authorize(undefined)
      expect(result).toBeNull()
    })

    it('returns null when credentials are null', async () => {
      const result = await authorize(null)
      expect(result).toBeNull()
    })
  })

  describe('redirect callback', () => {
    const redirect = authOptions.callbacks!.redirect!

    it('allows redirect when URL starts with baseUrl', async () => {
      const result = await redirect({
        url: 'http://localhost:3005/dashboard/recipients',
        baseUrl: 'http://localhost:3005',
      })
      expect(result).toBe('http://localhost:3005/dashboard/recipients')
    })

    it('redirects to /dashboard/whatsapp for external URLs', async () => {
      const result = await redirect({
        url: 'http://malicious.com/phishing',
        baseUrl: 'http://localhost:3005',
      })
      expect(result).toBe('http://localhost:3005/dashboard/whatsapp')
    })

    it('redirects to /dashboard/whatsapp for different-origin URLs', async () => {
      const result = await redirect({
        url: 'http://other-domain.com',
        baseUrl: 'http://localhost:3005',
      })
      expect(result).toBe('http://localhost:3005/dashboard/whatsapp')
    })
  })
})
