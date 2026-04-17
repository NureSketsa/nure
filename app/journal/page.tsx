// FILE LOCATION: app/journal/page.tsx
// This is the JOURNAL feature page (placeholder for Phase 3).
// Create a folder called "journal" inside your "app" folder, then put this file inside it.
// URL: nure.vercel.app/journal

'use client'

import FeatureLayout from '@/components/layout/FeatureLayout'

export default function JournalPage() {
    return (
        <FeatureLayout title="Journal" icon="🌫️">
            <div
                className="flex flex-col items-center justify-center py-32"
                style={{ color: '#8888aa', fontFamily: 'var(--font-display)' }}
            >
                <div className="text-4xl mb-4" style={{ opacity: 0.3 }}>🌫️</div>
                <p className="text-xs tracking-widest uppercase opacity-50">coming in phase 3</p>
            </div>
        </FeatureLayout>
    )
}