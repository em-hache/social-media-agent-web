'use client'

import { useEffect, useState, useCallback } from 'react'
import Topbar from '@/components/Topbar'

type PageState = 'loading' | 'active' | 'qr' | 'error'

export default function WhatsAppPage() {
  const [state, setState] = useState<PageState>('loading')
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  const poll = useCallback(async () => {
    try {
      setError('')
      const res = await fetch('/api/whatsapp/qr')

      if (res.status === 204) {
        setQrUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return null
        })
        setState('active')
        return
      }

      if (res.ok) {
        const blob = await res.blob()
        setQrUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return URL.createObjectURL(blob)
        })
        setState('qr')
        return
      }

      setState('error')
      setError('Error al obtener el código QR')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error'
      setError(message)
      setState('error')
    }
  }, [])

  useEffect(() => {
    poll()
    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [poll])

  return (
    <>
      <Topbar title="WhatsApp" />

      <div className="p-6">
        {state === 'loading' && (
          <p className="text-sm text-gray-500">Cargando...</p>
        )}

        {state === 'error' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={poll}
              title="Reintentar conexión"
              className="mt-3 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === 'active' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-gray-900">
                La sesión de WhatsApp está activa
              </p>
            </div>
          </div>
        )}

        {state === 'qr' && qrUrl && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Escanea el código QR para conectar
              </h3>
              <button
                onClick={poll}
                title="Actualizar código QR"
                className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                Actualizar
              </button>
            </div>
            <img
              src={qrUrl}
              alt="Código QR de WhatsApp"
              className="mx-auto h-64 w-64"
            />
          </div>
        )}
      </div>
    </>
  )
}
