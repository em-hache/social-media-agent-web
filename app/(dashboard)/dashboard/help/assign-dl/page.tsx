'use client'

import Topbar from '@/components/Topbar'

export default function AssignDLHelpPage() {
  return (
    <>
      <Topbar title="Asignar a listas de distribución" />
      <div className="p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
            <li>Ve a &quot;Listas de distribución&quot;</li>
            <li>Selecciona o crea una lista</li>
            <li>Agrega destinatarios a la lista</li>
            <li>Los mensajes se enviarán a todos los miembros</li>
          </ol>
        </div>
      </div>
    </>
  )
}
