// FILE LOCATION: app/todos/page.tsx
// This is the TODOS feature page (placeholder for Phase 2).
// Create a folder called "todos" inside your "app" folder, then put this file inside it.
// URL: nure.vercel.app/todos

'use client'

import FeatureLayout from '@/components/layout/FeatureLayout'

export default function TodosPage() {
    return (
        <FeatureLayout title="Todo List" icon="🪐">
            <div
                className="flex flex-col items-center justify-center py-32"
                style={{ color: '#8888aa', fontFamily: 'var(--font-display)' }}
            >
                <div className="text-4xl mb-4" style={{ opacity: 0.3 }}>🪐</div>
                <p className="text-xs tracking-widest uppercase opacity-50">coming in phase 2</p>
            </div>
        </FeatureLayout>
    )
}