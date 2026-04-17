// FILE LOCATION: app/calendar/page.tsx
// This is the CALENDAR feature page (placeholder for Phase 2).
// Create a folder called "calendar" inside your "app" folder, then put this file inside it.
// URL: nure.vercel.app/calendar

'use client'

import FeatureLayout from '@/components/layout/FeatureLayout'

export default function CalendarPage() {
    return (
        <FeatureLayout title="Calendar" icon="🌙">
            <div
                className="flex flex-col items-center justify-center py-32"
                style={{ color: '#8888aa', fontFamily: 'var(--font-display)' }}
            >
                <div className="text-4xl mb-4" style={{ opacity: 0.3 }}>🌙</div>
                <p className="text-xs tracking-widest uppercase opacity-50">coming in phase 2</p>
            </div>
        </FeatureLayout>
    )
}