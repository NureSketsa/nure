// FILE LOCATION: app/page.tsx
// Thin orchestrator. Does NOT contain any feature logic.
// Just: auth check → universe canvas → render active panel on top.
// To add a new feature: create a new Panel in components/features/, import it here.

'use client'

import { useState, useEffect } from 'react'
import { isAuthenticated } from '@/lib/auth'
import { useUniverseStore } from '@/lib/universeStore'

import PasswordGate from '@/components/layout/PasswordGate'
import UniverseScene from '@/components/universe/UniverseScene'

import HabitsPanel from '@/components/features/HabitsPanel'
import TodosPanel from '@/components/features/TodosPanel'
import CalendarPanel from '@/components/features/CalendarPanel'
import LinksPanel from '@/components/features/LinksPanel'
import JournalPanel from '@/components/features/JournalPanel'

export default function Home() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const { activePanel } = useUniverseStore()

  useEffect(() => {
    setAuthed(isAuthenticated())
  }, [])

  // Avoid flash before auth check
  if (authed === null) {
    return <div style={{ position: 'fixed', inset: 0, background: '#05050f' }} />
  }

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />
  }

  return (
    <>
      {/* Universe canvas — always mounted, never unmounts */}
      <UniverseScene />

      {/* Feature panels — rendered on top when active */}
      {activePanel === 'habits' && <HabitsPanel />}
      {activePanel === 'todos' && <TodosPanel />}
      {activePanel === 'calendar' && <CalendarPanel />}
      {activePanel === 'links' && <LinksPanel />}
      {activePanel === 'journal' && <JournalPanel />}
    </>
  )
}