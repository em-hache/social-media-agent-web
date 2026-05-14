'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { User, Recipient, Role } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import Tooltip from '@/components/Tooltip'
import Topbar from '@/components/Topbar'

const ALL_ROLES: Role[] = ['admin', 'manager', 'regular']

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editAlias, setEditAlias] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([])
  const [recipientSearch, setRecipientSearch] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [createAlias, setCreateAlias] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createRoles, setCreateRoles] = useState<Role[]>(['regular'])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users')
        return res.json()
      })
      .then((data) => setUsers(data))
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'Error'
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [])

  const fetchRecipients = useCallback(async () => {
    try {
      const res = await fetch('/api/recipients')
      if (res.ok) {
        const data: Recipient[] = await res.json()
        setAllRecipients(data)
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function openCreate() {
    setShowCreate(true)
    setSelectedRecipient(null)
    setRecipientSearch('')
    setCreateAlias('')
    setCreateEmail('')
    setCreateRoles(['regular'])
    setCreateError('')
    fetchRecipients()
  }

  const filteredRecipients = allRecipients.filter((r) => {
    if (!recipientSearch) return true
    const q = recipientSearch.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.phone.includes(q)
  })

  function toggleRole(role: Role) {
    setCreateRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  async function handleCreate() {
    if (!selectedRecipient) return
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/users/from-recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: selectedRecipient.id,
          alias: createAlias,
          email: createEmail,
          roles: createRoles.length > 0 ? createRoles : undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to create user')
      }
      const newUser: User = await res.json()
      setUsers((prev) => [...prev, newUser])
      setShowCreate(false)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setCreateError(message)
    } finally {
      setCreating(false)
    }
  }

  function openEdit(user: User) {
    setEditing(user)
    setEditName(user.name)
    setEditAlias(user.alias)
    setEditEmail(user.email)
    setError('')
  }

  function closeEdit() {
    setEditing(null)
  }

  async function handleSave() {
    if (!editing?.id) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/users/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, alias: editAlias, email: editEmail }),
      })
      if (!res.ok) throw new Error('Failed to update user')
      const updated: User = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      closeEdit()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(user: User) {
    if (!user.id) return
    try {
      const action = user.is_active ? 'deactivate' : 'activate'
      const res = await fetch(`/api/users/${user.id}/${action}`, { method: 'PUT' })
      if (!res.ok) throw new Error('Failed to update status')
      const updated: User = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
    }
  }

  return (
    <>
      <Topbar title="Usuarios" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            {users.length} usuarios
          </h3>
          <button
            onClick={openCreate}
            title="Crear nuevo usuario desde destinatario"
            className="rounded-md bg-brand-red px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-red/90"
          >
            + Nuevo usuario
          </button>
        </div>
        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Alias</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Correo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Número</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Roles</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Activo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.alias}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.number}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <StatusBadge key={role} status={role} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
                        <Tooltip text={user.is_active ? 'Desactivar' : 'Activar'}>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`rounded-md p-1 ${
                              user.is_active
                                ? 'text-orange-500 hover:bg-orange-50 hover:text-orange-700'
                                : 'text-green-500 hover:bg-green-50 hover:text-green-700'
                            }`}
                          >
                            {user.is_active ? (
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
                          onClick={() => openEdit(user)}
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
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Editar usuario</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Alias</label>
                <input
                  type="text"
                  value={editAlias}
                  onChange={(e) => setEditAlias(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Correo</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeEdit}
                title="Cancelar edición"
                className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                title="Guardar cambios"
                className="rounded-md bg-brand-red px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-red/90 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Nuevo usuario desde destinatario
            </h3>
            {createError && (
              <p className="mb-3 text-sm text-red-600">{createError}</p>
            )}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Destinatario
                </label>
                <div ref={dropdownRef} className="relative">
                  <input
                    type="text"
                    placeholder="Buscar destinatario por nombre o teléfono..."
                    value={recipientSearch}
                    onChange={(e) => {
                      setRecipientSearch(e.target.value)
                      setSelectedRecipient(null)
                      setDropdownOpen(true)
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                  {dropdownOpen && filteredRecipients.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                      {filteredRecipients.map((r) => (
                        <li
                          key={r.id}
                          onClick={() => {
                            setSelectedRecipient(r)
                            setRecipientSearch(`${r.name} (${r.phone})`)
                            setDropdownOpen(false)
                            if (!createEmail && r.email) setCreateEmail(r.email)
                          }}
                          className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 ${
                            selectedRecipient?.id === r.id ? 'bg-blue-50 font-medium' : ''
                          }`}
                        >
                          <span className="text-gray-900">{r.name}</span>
                          <span className="ml-2 text-gray-500">({r.phone})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {dropdownOpen && filteredRecipients.length === 0 && recipientSearch && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                      Sin destinatarios coincidentes
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Alias</label>
                <input
                  type="text"
                  value={createAlias}
                  onChange={(e) => setCreateAlias(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Correo</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Roles</label>
                <div className="flex gap-4">
                  {ALL_ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-1.5 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={createRoles.includes(role)}
                        onChange={() => toggleRole(role)}
                        className="rounded border-gray-300"
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                title="Cancelar creación"
                className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !selectedRecipient}
                title="Crear usuario"
                className="rounded-md bg-brand-red px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-red/90 disabled:opacity-50"
              >
                {creating ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
