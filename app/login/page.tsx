'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    })
    setLoading(false)
    if (res?.ok) {
      router.push('/dashboard')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream">
      <div className="w-full max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col items-center bg-brand-cream px-8 pt-8 pb-6">
          <Image src="/logo.png" alt="Comunicación con la Comunidad" width={160} height={160} priority />
          <h1 className="mt-4 text-center text-xl font-semibold text-gray-900">
            Comunicación con la Comunidad
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-8">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand-red px-4 py-2 text-sm font-medium text-white hover:bg-brand-red/90 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
