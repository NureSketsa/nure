// FILE LOCATION: lib/universeStore.ts
// Shared state between the universe canvas and all feature panels.
// When a planet is clicked, activePanel is set here.
// The canvas reads it to know when to zoom in/out.

import { create } from 'zustand'

export type PanelId = 'habits' | 'todos' | 'calendar' | 'journal' | 'links' | null

interface UniverseStore {
    activePanel: PanelId
    isZooming: boolean
    setActivePanel: (id: PanelId) => void
    setIsZooming: (v: boolean) => void
}

export const useUniverseStore = create<UniverseStore>((set) => ({
    activePanel: null,
    isZooming: false,
    setActivePanel: (id) => set({ activePanel: id }),
    setIsZooming: (v) => set({ isZooming: v }),
}))