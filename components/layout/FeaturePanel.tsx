// FILE LOCATION: components/layout/FeaturePanel.tsx
// Overlay wrapper for all feature panels.
// Fades in over the universe canvas. Back button triggers zoom-out.
// Each feature panel (HabitsPanel, TodosPanel, etc.) is wrapped in this.

'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useUniverseStore } from '@/lib/universeStore'

interface FeaturePanelProps {
    children: ReactNode
    title: string
    color: string
}

export default function FeaturePanel({ children, title, color }: FeaturePanelProps) {
    const { setActivePanel } = useUniverseStore()
    const [visible, setVisible] = useState(false)

    // Fade in on mount
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 30)
        return () => clearTimeout(t)
    }, [])

    const handleBack = () => {
        // Fade out first, then clear panel (which triggers zoom-out in UniverseScene)
        setVisible(false)
        setTimeout(() => setActivePanel(null), 500)
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 30,
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease',
            pointerEvents: visible ? 'auto' : 'none',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Dark overlay — lets planet show through slightly */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(5,5,15,0.82)',
                backdropFilter: 'blur(2px)',
            }} />

            {/* Header */}
            <div style={{
                position: 'relative', zIndex: 10,
                display: 'flex', alignItems: 'center',
                padding: '20px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: 'rgba(5,5,15,0.6)',
                flexShrink: 0,
            }}>
                <button
                    onClick={handleBack}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#8888aa', fontFamily: 'var(--font-display)',
                        fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
                        padding: 0, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f0f0f0'}
                    onMouseLeave={e => e.currentTarget.style.color = '#8888aa'}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    universe
                </button>

                <h1 style={{
                    flex: 1, textAlign: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '12px',
                    letterSpacing: '0.35em', textTransform: 'uppercase',
                    color, margin: 0,
                }}>
                    {title}
                </h1>

                {/* Spacer to balance back button */}
                <div style={{ width: '80px' }} />
            </div>

            {/* Scrollable content */}
            <div style={{
                position: 'relative', zIndex: 10,
                flex: 1, overflowY: 'auto',
                padding: '40px 32px',
                maxWidth: '860px', width: '100%',
                margin: '0 auto', boxSizing: 'border-box',
            }}>
                {children}
            </div>
        </div>
    )
}