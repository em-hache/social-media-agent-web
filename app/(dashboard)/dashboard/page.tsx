'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/Topbar'
import type { User, Recipient, DistributionListSummary, OutboxEntry } from '@/lib/types'

interface Stats {
  sentLast7Days: number
  pending: number
  totalUsers: number
  activeUsers: number
  totalRecipients: number
  activeRecipients: number
  totalInscripciones: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const start = sevenDaysAgo.toISOString().split('T')[0]
    const end = now.toISOString().split('T')[0]

    Promise.all([
      fetch('/api/outbox/pending').then((r) => r.ok ? r.json() : []),
      fetch(`/api/outbox/sent?start=${start}&end=${end}`).then((r) => r.ok ? r.json() : []),
      fetch('/api/users').then((r) => r.ok ? r.json() : []),
      fetch('/api/recipients').then((r) => r.ok ? r.json() : []),
      fetch('/api/lists').then((r) => r.ok ? r.json() : []),
    ])
      .then(([pending, sent, users, recipients, lists]: [OutboxEntry[], OutboxEntry[], User[], Recipient[], DistributionListSummary[]]) => {
        setStats({
          sentLast7Days: sent.length,
          pending: pending.length,
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.is_active).length,
          totalRecipients: recipients.length,
          activeRecipients: recipients.filter((r) => r.is_active).length,
          totalInscripciones: lists.reduce((sum, l) => sum + l.recipient_count, 0),
        })
      })
      .catch(() => {
        setStats(null)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Topbar title="Panel principal" />
      <div className="p-6 space-y-6">
        {/* Stats grid */}
        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {!loading && stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-500">Mensajes</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.sentLast7Days}</p>
              <p className="mt-1 text-xs text-gray-500">enviados (últimos 7 días)</p>
              <p className="mt-2 text-sm text-gray-600">{stats.pending} pendientes</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-500">Usuarios</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              <p className="mt-1 text-xs text-gray-500">total</p>
              <p className="mt-2 text-sm text-gray-600">{stats.activeUsers} activos</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-500">Destinatarios</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalRecipients}</p>
              <p className="mt-1 text-xs text-gray-500">total</p>
              <p className="mt-2 text-sm text-gray-600">{stats.activeRecipients} activos</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-500">Inscripciones</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalInscripciones}</p>
              <p className="mt-1 text-xs text-gray-500">en listas de distribución</p>
            </div>
          </div>
        )}

        {/* Help section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Guía rápida</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900">1. Inscribir destinatarios</h4>
              <ol className="mt-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Ve a la sección &quot;Destinatarios&quot;</li>
                <li>Haz clic en &quot;+ Nuevo destinatario&quot;</li>
                <li>Completa el nombre y número de teléfono</li>
                <li>Guarda el destinatario</li>
              </ol>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">2. Enviar mensajes</h4>
              <ol className="mt-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Ve a &quot;Historial de mensajes&quot;</li>
                <li>Selecciona una lista de distribución</li>
                <li>Redacta o genera el mensaje</li>
                <li>Revisa y confirma el envío</li>
              </ol>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">3. Asignar a listas de distribución</h4>
              <ol className="mt-2 space-y-1 text-sm text-gray-600 list-decimal list-inside">
                <li>Ve a &quot;Listas de distribución&quot;</li>
                <li>Selecciona o crea una lista</li>
                <li>Agrega destinatarios a la lista</li>
                <li>Los mensajes se enviarán a todos los miembros</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
