'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

type WhatsAppState = 'unknown' | 'active' | 'inactive'

const STORAGE_KEY = 'sidebar-width'
const DEFAULT_WIDTH = 240
const MIN_WIDTH = 180
const MAX_WIDTH = 400

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
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const isResizing = useRef(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = Number(stored)
      if (parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
        setWidth(parsed)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(width))
  }, [width])

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true

    const startX = e.clientX
    const startWidth = width

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + (e.clientX - startX)))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [width])

  const waActive = pathname.startsWith('/dashboard/whatsapp')

  // Mobile top navigation (below md breakpoint)
  const mobileNav = (
    <aside className="flex md:hidden flex-row items-center gap-2 border-b border-gray-200 bg-brand-cream px-3 py-2 overflow-x-auto">
      <Link href="/dashboard">
        <Image src="/logo.png" alt="CommAgent" width={32} height={32} className="h-8 w-8 flex-shrink-0" />
      </Link>
      <nav className="flex flex-row items-center gap-1 flex-1 overflow-x-auto">
        {links.map((link) => {
          const active = pathname.startsWith(link.href)
          if (link.disabled) {
            return (
              <span
                key={link.href}
                className="cursor-not-allowed whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-gray-400"
              >
                {link.label}
              </span>
            )
          }
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${
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
      <Link
        href="/dashboard/whatsapp"
        className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium flex-shrink-0 ${
          waActive
            ? 'bg-brand-cream text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        WA
        {waState !== 'unknown' && (
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              waState === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
        )}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        title="Cerrar sesión"
        className="flex-shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      >
        Salir
      </button>
    </aside>
  )

  // Desktop sidebar (md and up)
  const desktopSidebar = (
    <aside
      className="hidden md:flex flex-col border-r border-gray-200 bg-brand-cream relative"
      style={{ width }}
    >
      <Link href="/dashboard" className="block py-5">
        <Image src="/logo.png" alt="CommAgent" width={240} height={240} className="w-full" />
      </Link>
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
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize border-r border-transparent hover:border-gray-400 transition-colors"
      />
    </aside>
  )

  return (
    <>
      {mobileNav}
      {desktopSidebar}
    </>
  )
}
