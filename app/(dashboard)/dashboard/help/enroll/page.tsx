'use client'

import Image from 'next/image'
import Topbar from '@/components/Topbar'

export default function EnrollHelpPage() {
  return (
    <>
      <Topbar title="Cómo suscribirse" />
      <div className="p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <Image
            src="/Enroll.jpg"
            alt="Tutorial de inscripción"
            width={1920}
            height={1080}
            className="w-full rounded-md"
          />
        </div>
      </div>
    </>
  )
}
