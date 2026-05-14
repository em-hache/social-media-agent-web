'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import type { DistributionList, Recipient } from '@/lib/types'
import Tooltip from '@/components/Tooltip'
import Topbar from '@/components/Topbar'

export default function ListDetailPage() {
  const params = useParams<{ id: string }>()
  const listName = decodeURIComponent(params.id)

  const [list, setList] = useState<DistributionList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [description, setDescription] = useState('')

  const [allRecipients, setAllRecipients] = useState<Recipient[]>([])
  const [recipientSearch, setRecipientSearch] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch(`/api/lists/${encodeURIComponent(listName)}`)
      if (!res.ok) throw new Error('Failed to fetch list')
      const data: DistributionList = await res.json()
      setList(data)
      setDescription(data.description)
      setError('')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [listName])

  const [recipientsError, setRecipientsError] = useState(false)

  const fetchRecipients = useCallback(async () => {
    try {
      setRecipientsError(false)
      const res = await fetch('/api/recipients')
      if (!res.ok) throw new Error('Failed')
      const data: Recipient[] = await res.json()
      setAllRecipients(data)
    } catch {
      setRecipientsError(true)
    }
  }, [])

  useEffect(() => {
    fetchList()
    fetchRecipients()
  }, [fetchList, fetchRecipients])

  const availableRecipients = allRecipients.filter((r) => {
    const memberIds = new Set(list?.recipients.map((m) => m.id) ?? [])
    if (memberIds.has(r.id)) return false
    if (!recipientSearch) return true
    const q = recipientSearch.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.phone.includes(q)
  })

  async function handleSave() {
    if (!list) return
    setSaving(true)
    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: list.name, description }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const updated: DistributionList = await res.json()
      setList(updated)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveMember(recipientId: string) {
    if (!list) return
    try {
      const res = await fetch(`/api/lists/${list.id}/recipients`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: recipientId }),
      })
      if (!res.ok) throw new Error('Failed to remove')
      setList((prev) =>
        prev
          ? { ...prev, recipients: prev.recipients.filter((r) => r.id !== recipientId) }
          : prev
      )
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    }
  }

  async function handleAddMember() {
    if (!selectedRecipient || !list) return
    try {
      const res = await fetch(`/api/lists/${list.id}/recipients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: selectedRecipient }),
      })
      if (!res.ok) throw new Error('Failed to add')
      setSelectedRecipient('')
      setRecipientSearch('')
      setDropdownOpen(false)
      await fetchList()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    }
  }

  return (
    <>
      <Topbar title={list?.name ?? 'Detalle de lista'} />
      <div className="p-6">
        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {!loading && list && (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-900">
                {list.name}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  title="Guardar descripción"
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-900">
                Destinatarios ({list.recipients.length})
              </h3>
              <div className="relative mb-4 flex items-center gap-2">
                <div ref={dropdownRef} className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar y seleccionar destinatario..."
                    value={recipientSearch}
                    onChange={(e) => {
                      setRecipientSearch(e.target.value)
                      setSelectedRecipient('')
                      setDropdownOpen(true)
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {dropdownOpen && availableRecipients.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                      {availableRecipients.map((r) => (
                        <li
                          key={r.id}
                          onClick={() => {
                            setSelectedRecipient(r.id)
                            setRecipientSearch(`${r.name} (${r.phone})`)
                            setDropdownOpen(false)
                          }}
                          className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 ${
                            selectedRecipient === r.id ? 'bg-blue-50 font-medium' : ''
                          }`}
                        >
                          <span className="text-gray-900">{r.name}</span>
                          <span className="ml-2 text-gray-500">({r.phone})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {dropdownOpen && availableRecipients.length === 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                      {recipientsError
                        ? 'Error al cargar destinatarios'
                        : allRecipients.length === 0
                          ? 'No hay destinatarios disponibles'
                          : 'Sin destinatarios coincidentes'}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedRecipient}
                  title="Añadir destinatario a la lista"
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Añadir
                </button>
              </div>
              {list.recipients.length === 0 && (
                <p className="text-sm text-gray-500">No hay destinatarios en esta lista.</p>
              )}
              <div className="divide-y divide-gray-200">
                {list.recipients.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm leading-tight text-gray-900">{r.name}</p>
                      <p className="text-xs leading-tight text-gray-500">
                        {r.phone}
                        {r.email && <span> &middot; {r.email}</span>}
                      </p>
                    </div>
                    <Tooltip text="Eliminar de la lista">
                      <button
                        onClick={() => handleRemoveMember(r.id)}
                        className="ml-3 shrink-0 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
