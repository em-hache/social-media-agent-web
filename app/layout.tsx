import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import SessionProvider from '@/components/SessionProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CommAgent Admin',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-white">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
