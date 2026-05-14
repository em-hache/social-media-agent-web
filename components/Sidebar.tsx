'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

type WhatsAppState = 'unknown' | 'active' | 'inactive'

const links = [
  { href: '/dashboard/users', label: 'Usuarios' },
  { href: '/dashboard/recipients', label: 'Destinatarios' },
  { href: '/dashboard/lists', label: 'Listas de distribución' },
  { href: '/dashboard/history', label: 'Redactar mensaje', disabled: true },
  { href: '/dashboard/outbox', label: 'Historial de mensajes' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [waState, setWaState] = useState<WhatsAppState>('unknown')

  const pollWhatsApp = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/qr')
      setWaState(res.status === 204 ? 'active' : 'inactive')
    } catch {
      setWaState('inactive')
    }
  }, [])

  useEffect(() => {
    pollWhatsApp()
    const interval = setInterval(pollWhatsApp, 10000)
    return () => clearInterval(interval)
  }, [pollWhatsApp])

  const waActive = pathname.startsWith('/dashboard/whatsapp')

  return (
    <aside className="flex w-60 flex-col border-r border-gray-200 bg-brand-cream">
      <div className="py-5">
        <Image src="/logo.png" alt="CommAgent" width={240} height={240} className="w-full" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {links.map((link) => {
          const active = pathname.startsWith(link.href)
          if (link.disabled) {
            return (
              <span
                key={link.href}
                className="cursor-not-allowed rounded-md px-3 py-2 text-sm font-medium text-gray-400"
              >
                {link.label}
              </span>
            )
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                active
                  ? 'bg-brand-cream text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-200 px-2 py-2">
        <Link
          href="/dashboard/whatsapp"
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
            waActive
              ? 'bg-brand-cream text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          WhatsApp
          {waState !== 'unknown' && (
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                waState === 'active' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          )}
        </Link>
      </div>
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Cerrar sesión"
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
