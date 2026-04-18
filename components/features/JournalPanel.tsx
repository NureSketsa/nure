// FILE LOCATION: components/features/JournalPanel.tsx
// Self-contained journal feature — Phase 3.
// To work on just this file, you only need this + FeaturePanel + supabase lib.

'use client'

import FeaturePanel from '@/components/layout/FeaturePanel'

export default function JournalPanel() {
    return (
        <FeaturePanel title="Journal" color="#cc66ff">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#8888aa' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.5 }}>coming in phase 3</p>
            </div>
        </FeaturePanel>
    )
}