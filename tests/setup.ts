import '@testing-library/jest-dom'

// Mock next/navigation (used by client components)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-auth/react (client-side session)
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Admin' } },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: any) => children,
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock next/link as a plain anchor
jest.mock('next/link', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: ({ children, href, ...props }: any) =>
      React.createElement('a', { href, ...props }, children),
  }
})

// Provide a fresh fetch mock before every test
beforeEach(() => {
  global.fetch = jest.fn()
})
