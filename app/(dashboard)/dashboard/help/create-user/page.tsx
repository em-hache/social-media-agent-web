'use client'

import Topbar from '@/components/Topbar'

export default function CreateUserHelpPage() {
  return (
    <>
      <Topbar title="Crear usuario" />
      <div className="p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
            <li>Ve a la sección &quot;Usuarios&quot;</li>
            <li>Haz clic en &quot;+ Nuevo usuario&quot;</li>
            <li>Selecciona un destinatario existente</li>
            <li>Asigna alias, correo y roles</li>
          </ol>
        </div>
      </div>
    </>
  )
}
