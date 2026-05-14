'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import type { User, CraftMessageResponse } from '@/lib/types'
import Topbar from '@/components/Topbar'

export default function CraftMessagePage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const [bulletPoints, setBulletPoints] = useState('')
  const [orgContext, setOrgContext] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CraftMessageResponse | null>(null)

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setUsers(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true
    const q = userSearch.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.alias.toLowerCase().includes(q)
  })

  const handleSubmit = useCallback(async () => {
    if (!selectedUserId || !bulletPoints.trim()) return
    setSending(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          bullet_points: bulletPoints,
          organization_context: orgContext || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to craft message')
      }
      const data: CraftMessageResponse = await res.json()
      setResult(data)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    } finally {
      setSending(false)
    }
  }, [selectedUserId, bulletPoints, orgContext])

  return (
    <>
      <Topbar title="Redactar mensaje" />
      <div className="p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-medium text-gray-900">
              Redactar un mensaje a partir de puntos clave
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Usuario
                </label>
                <div ref={userDropdownRef} className="relative">
                  <input
                    type="text"
                    placeholder="Buscar usuario por nombre o alias..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value)
                      setSelectedUserId('')
                      setUserDropdownOpen(true)
                    }}
                    onFocus={() => setUserDropdownOpen(true)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {userDropdownOpen && filteredUsers.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                      {filteredUsers.map((u) => (
                        <li
                          key={u.id}
                          onClick={() => {
                            setSelectedUserId(u.id ?? '')
                            setUserSearch(`${u.name}${u.alias ? ` (${u.alias})` : ''}`)
                            setUserDropdownOpen(false)
                          }}
                          className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 ${
                            selectedUserId === u.id ? 'bg-blue-50 font-medium' : ''
                          }`}
                        >
                          <span className="text-gray-900">{u.name}</span>
                          {u.alias && (
                            <span className="ml-2 text-gray-500">({u.alias})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {userDropdownOpen && filteredUsers.length === 0 && userSearch && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                      Sin usuarios coincidentes
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Puntos clave
                </label>
                <textarea
                  value={bulletPoints}
                  onChange={(e) => setBulletPoints(e.target.value)}
                  rows={5}
                  placeholder="Escribe los puntos clave aquí..."
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Contexto de organización <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={orgContext}
                  onChange={(e) => setOrgContext(e.target.value)}
                  placeholder="ej. colegio, empresa, grupo comunitario..."
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={sending || !selectedUserId || !bulletPoints.trim()}
                title="Generar mensaje a partir de los puntos clave"
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? 'Redactando...' : 'Redactar mensaje'}
              </button>
            </div>
          </div>

          {result && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Mensaje redactado
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.crafted_message)
                  }}
                  title="Copiar mensaje al portapapeles"
                  className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                >
                  Copiar
                </button>
              </div>
              <div className="whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-800">
                {result.crafted_message}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
