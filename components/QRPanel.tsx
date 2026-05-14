'use client'

export default function QRPanel({
  qr,
  onRefresh,
}: {
  qr: string | null
  onRefresh: () => void
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Código QR</h3>
        <button
          onClick={onRefresh}
          title="Actualizar código QR"
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
        >
          Actualizar
        </button>
      </div>
      {qr ? (
        <img src={qr} alt="Código QR de WhatsApp" className="mx-auto h-64 w-64" />
      ) : (
        <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-lg bg-gray-100">
          <span className="text-sm text-gray-400">QR no disponible</span>
        </div>
      )}
    </div>
  )
}
