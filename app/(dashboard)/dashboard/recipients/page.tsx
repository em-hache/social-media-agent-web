'use client'

import { useEffect, useState, useMemo } from 'react'
import type { Recipient } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import Tooltip from '@/components/Tooltip'
import Topbar from '@/components/Topbar'

const PAGE_SIZE = 10

export default function RecipientsPage() {
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const [editing, setEditing] = useState<Recipient | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/recipients')
        if (!res.ok) throw new Error('Failed to fetch recipients')
        const data: Recipient[] = await res.json()
        setAllRecipients(data)
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Error'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!search) return allRecipients
    const q = search.toLowerCase()
    return allRecipients.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        (r.email && r.email.toLowerCase().includes(q))
    )
  }, [allRecipients, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search])

  function openEdit(r: Recipient) {
    setEditing(r)
    setEditName(r.name)
    setEditEmail(r.email ?? '')
    setEditError('')
  }

  async function handleToggleActive(r: Recipient) {
    try {
      const action = r.is_active ? 'deactivate' : 'activate'
      const res = await fetch(`/api/recipients/${r.id}/${action}`, { method: 'PUT' })
      if (!res.ok) throw new Error('Failed to update status')
      const updated: Recipient = await res.json()
      setAllRecipients((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x))
      )
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    }
  }

  async function handleEditSave() {
    if (!editing) return
    setEditSaving(true)
    setEditError('')
    try {
      const res = await fetch(`/api/recipients/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editing.phone, email: editEmail }),
      })
      if (!res.ok) throw new Error('Failed to update recipient')
      const updated: Recipient = await res.json()
      setAllRecipients((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      )
      setEditing(null)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setEditError(message)
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <>
      <Topbar title="Destinatarios" />
      <div className="p-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Filtrar por nombre, teléfono o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-gray-500">
            {search ? 'Ningún destinatario coincide con tu filtro.' : 'No se encontraron destinatarios.'}
          </p>
        )}
        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Teléfono</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Correo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Activo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paged.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{r.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{r.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={r.is_active ? 'active' : 'inactive'} />
                          <Tooltip text={r.is_active ? 'Desactivar' : 'Activar'}>
                            <button
                              onClick={() => handleToggleActive(r)}
                              className={`rounded-md p-1 ${
                                r.is_active
                                  ? 'text-orange-500 hover:bg-orange-50 hover:text-orange-700'
                                  : 'text-green-500 hover:bg-green-50 hover:text-green-700'
                              }`}
                            >
                              {r.is_active ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                  <path fillRule="evenodd" d="M5.965 4.904l9.131 9.131a6.5 6.5 0 00-9.131-9.131zm-1.06 1.06a6.5 6.5 0 009.131 9.131L4.904 5.965zM10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Tooltip text="Editar">
                          <button
                            onClick={() => openEdit(r)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                            </svg>
                          </button>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  title="Página anterior"
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-xs text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  title="Página siguiente"
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}

        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-sm font-medium text-gray-900">
                Editar destinatario
              </h3>
              {editError && (
                <p className="mb-3 text-sm text-red-600">{editError}</p>
              )}
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Correo</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setEditing(null)}
                  title="Cancelar edición"
                  className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={editSaving}
                  title="Guardar cambios"
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {editSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
