// FILE LOCATION: app/page.tsx
// This is the HOME page — the universe map with the password gate.
// It lives at the ROOT of your app folder, not inside any subfolder.
// URL: nure.vercel.app/

'use client'

import { useState, useEffect } from 'react'
import { isAuthenticated } from '@/lib/auth'
import PasswordGate from '@/components/layout/PasswordGate'
import UniverseScene from '@/components/universe/UniverseScene'

export default function Home() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    setAuthed(isAuthenticated())
  }, [])

  // Loading state — avoid flash
  if (authed === null) {
    return <div className="fixed inset-0" style={{ background: '#05050f' }} />
  }

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />
  }

  return <UniverseScene />
}