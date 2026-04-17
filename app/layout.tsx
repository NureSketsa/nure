// FILE LOCATION: app/layout.tsx
import type { Metadata } from 'next'
import { Orbitron, DM_Sans } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '700', '900'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'NURE',
  description: 'Light in the void.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${dmSans.variable}`}>
      <body className="bg-[#05050f] text-[#f0f0f0] font-body antialiased">
        {children}
      </body>
    </html>
  )
}