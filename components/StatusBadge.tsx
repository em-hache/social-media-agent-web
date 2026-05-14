'use client'

const colorMap: Record<string, string> = {
  connected: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  sent: 'bg-green-100 text-green-700',
  disconnected: 'bg-red-100 text-red-700',
  inactive: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  regular: 'bg-gray-100 text-gray-700',
}

const labelMap: Record<string, string> = {
  connected: 'conectado',
  active: 'activo',
  sent: 'enviado',
  disconnected: 'desconectado',
  inactive: 'inactivo',
  failed: 'fallido',
  pending: 'pendiente',
  pending_approval: 'pendiente de aprobación',
  approved: 'aprobado',
  rejected: 'rechazado',
  admin: 'admin',
  manager: 'gestor',
  regular: 'regular',
}

export default function StatusBadge({ status }: { status: string }) {
  const colors = colorMap[status] ?? 'bg-gray-100 text-gray-700'
  const label = labelMap[status] ?? status.replace('_', ' ')
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}
    >
      {label}
    </span>
  )
}
