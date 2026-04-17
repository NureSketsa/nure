// FILE LOCATION: components/layout/FeatureLayout.tsx
'use client'

import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface FeatureLayoutProps {
    children: ReactNode
    title: string
    icon: string
}

export default function FeatureLayout({ children, title, icon }: FeatureLayoutProps) {
    const router = useRouter()

    return (
        <div className="page-scroll min-h-screen" style={{ background: '#05050f' }}>
            {/* Subtle star texture */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(1px 1px at ${Array.from({ length: 30 }, (_, i) =>
                        `${Math.sin(i * 137.5) * 50 + 50}% ${Math.cos(i * 137.5) * 50 + 50}%`
                    ).join(', ')}, rgba(255,255,255,0.15) 0%, transparent 100%)`,
                    opacity: 0.4,
                }}
            />

            {/* Header */}
            <div
                className="sticky top-0 z-50 flex items-center gap-4 px-8 py-5"
                style={{
                    background: 'rgba(5,5,15,0.85)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
            >
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-xs tracking-widest uppercase transition-opacity duration-200 hover:opacity-100"
                    style={{
                        color: '#8888aa',
                        fontFamily: 'var(--font-display)',
                        opacity: 0.6,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    universe
                </button>

                <div className="flex-1 flex items-center justify-center gap-3">
                    <span style={{ fontSize: '18px' }}>{icon}</span>
                    <h1
                        className="text-sm tracking-[0.3em] uppercase"
                        style={{ fontFamily: 'var(--font-display)', color: '#f5a623' }}
                    >
                        {title}
                    </h1>
                </div>

                {/* Spacer to balance */}
                <div style={{ width: '80px' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-3xl mx-auto px-8 py-10">
                {children}
            </div>
        </div>
    )
}