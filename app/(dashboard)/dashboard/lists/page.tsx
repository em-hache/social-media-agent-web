'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { DistributionListSummary } from '@/lib/types'
import Topbar from '@/components/Topbar'

export default function ListsPage() {
  const [lists, setLists] = useState<DistributionListSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/lists')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch lists')
        return res.json()
      })
      .then((data) => setLists(data))
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'Error'
        setError(message)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Topbar title="Listas de distribución" />
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            {lists.length} listas
          </h3>
        </div>
        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {lists.map((list) => (
              <div
                key={list.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {list.name}
                  </h4>
                </div>
                <p className="mb-3 text-xs text-gray-500">{list.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {list.recipient_count} destinatarios
                  </span>
                  <Link
                    href={`/dashboard/lists/${encodeURIComponent(list.name)}`}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
