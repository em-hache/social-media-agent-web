'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { OutboxEntry, OutboxStatus, Recipient } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import Tooltip from '@/components/Tooltip'
import Topbar from '@/components/Topbar'

type Tab = 'pending' | 'sent' | 'by-recipient'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

export default function OutboxPage() {
  const [tab, setTab] = useState<Tab>('pending')
  const [entries, setEntries] = useState<OutboxEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState<OutboxEntry | null>(null)

  // Sent filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10))

  // By-recipient filters
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([])
  const [recipientSearch, setRecipientSearch] = useState('')
  const [selectedPhone, setSelectedPhone] = useState('')
  const [recipientDropdownOpen, setRecipientDropdownOpen] = useState(false)
  const recipientDropdownRef = useRef<HTMLDivElement>(null)
  const [statusFilter, setStatusFilter] = useState<OutboxStatus | ''>('')

  useEffect(() => {
    fetch('/api/recipients')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setAllRecipients(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (recipientDropdownRef.current && !recipientDropdownRef.current.contains(e.target as Node)) {
        setRecipientDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredRecipients = allRecipients.filter((r) => {
    if (!recipientSearch) return true
    const q = recipientSearch.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.phone.includes(q)
  })

  const fetchPending = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/outbox/pending')
      if (!res.ok) throw new Error('Failed to fetch pending messages')
      const data: OutboxEntry[] = await res.json()
      setEntries(data)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSent = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const start = new Date(startDate).toISOString()
      const end = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000).toISOString()
      const params = new URLSearchParams({ start, end })
      const res = await fetch(`/api/outbox/sent?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch sent messages')
      const data: OutboxEntry[] = await res.json()
      setEntries(data)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  const fetchByRecipient = useCallback(async () => {
    if (!selectedPhone) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ phone: selectedPhone })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/outbox/by-recipient?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      const data: OutboxEntry[] = await res.json()
      setEntries(data)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [selectedPhone, statusFilter])

  useEffect(() => {
    if (tab === 'pending') fetchPending()
  }, [tab, fetchPending])

  useEffect(() => {
    if (tab === 'sent') fetchSent()
  }, [tab, fetchSent])

  return (
    <>
      <Topbar title="Historial de mensajes" />
      <div className="p-6">
        <div className="mb-4 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {([
            { key: 'pending', label: 'Pendientes' },
            { key: 'sent', label: 'Enviados' },
            { key: 'by-recipient', label: 'Por destinatario' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setEntries([]) }}
              title={t.label}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'sent' && (
          <div className="mb-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-700">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {tab === 'by-recipient' && (
          <div className="mb-4 flex items-center gap-3">
            <div ref={recipientDropdownRef} className="relative w-64">
              <input
                type="text"
                placeholder="Buscar destinatario..."
                value={recipientSearch}
                onChange={(e) => {
                  setRecipientSearch(e.target.value)
                  setSelectedPhone('')
                  setRecipientDropdownOpen(true)
                }}
                onFocus={() => setRecipientDropdownOpen(true)}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {recipientDropdownOpen && filteredRecipients.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                  {filteredRecipients.map((r) => (
                    <li
                      key={r.id}
                      onClick={() => {
                        setSelectedPhone(r.phone)
                        setRecipientSearch(`${r.name} (${r.phone})`)
                        setRecipientDropdownOpen(false)
                      }}
                      className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 ${
                        selectedPhone === r.phone ? 'bg-blue-50 font-medium' : ''
                      }`}
                    >
                      <span className="text-gray-900">{r.name}</span>
                      <span className="ml-2 text-gray-500">({r.phone})</span>
                    </li>
                  ))}
                </ul>
              )}
              {recipientDropdownOpen && filteredRecipients.length === 0 && recipientSearch && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                  Sin destinatarios coincidentes
                </div>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OutboxStatus | '')}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="sent">Enviado</option>
              <option value="failed">Fallido</option>
            </select>
            <button
              onClick={fetchByRecipient}
              disabled={!selectedPhone}
              title="Buscar mensajes del destinatario"
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Buscar
            </button>
          </div>
        )}

        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <p className="mb-3 text-xs text-gray-500">
              {entries.length} {entries.length === 1 ? 'mensaje' : 'mensajes'}
            </p>
            {entries.length === 0 ? (
              <p className="text-sm text-gray-500">No se encontraron mensajes.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Destinatario</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Enviado el</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {formatDate(entry.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>
                            {entry.recipient_name && (
                              <p className="text-gray-900">{entry.recipient_name}</p>
                            )}
                            <p className="text-xs text-gray-500">{entry.recipient_phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={entry.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {entry.completed_at ? formatDate(entry.completed_at) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDetail(entry)}
                            title="Ver detalles del mensaje"
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Detalles del mensaje</h3>
              <Tooltip text="Cerrar">
                <button
                  onClick={() => setDetail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
              </Tooltip>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="font-medium text-gray-700">Destinatario:</span>
                <span className="text-gray-900">
                  {detail.recipient_name ? `${detail.recipient_name} (${detail.recipient_phone})` : detail.recipient_phone}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-700">Estado:</span>
                <StatusBadge status={detail.status} />
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-700">Creado:</span>
                <span className="text-gray-600">{formatDate(detail.created_at)}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-700">Enviado el:</span>
                <span className="text-gray-600">{detail.completed_at ? formatDate(detail.completed_at) : '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Mensaje:</span>
                <div className="mt-1 whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-800">
                  {detail.message_body ?? 'Sin contenido de mensaje'}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDetail(null)}
                title="Cerrar ventana de detalles"
                className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
