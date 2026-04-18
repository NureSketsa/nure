// FILE LOCATION: components/features/JournalPanel.tsx
// Self-contained journal feature. Weekly + monthly reflection modes.
// Past entries shown in a timeline. No editing past entries.
// To work on just this file, you only need this + FeaturePanel + supabase lib.

'use client'

import { useState, useEffect } from 'react'
import FeaturePanel from '@/components/layout/FeaturePanel'
import { supabase } from '@/lib/supabase'

interface JournalEntry {
    id: string
    type: 'weekly' | 'monthly'
    entry_date: string
    went_well: string
    to_improve: string
    grateful_for: string
    created_at: string
}

type Mode = 'weekly' | 'monthly'

const PROMPTS = [
    { key: 'went_well', label: 'What went well?', placeholder: 'Wins, moments, progress...' },
    { key: 'to_improve', label: 'What to improve?', placeholder: 'Honest reflection...' },
    { key: 'grateful_for', label: 'What are you grateful for?', placeholder: 'Big or small...' },
]

function formatEntryDate(dateStr: string, type: 'weekly' | 'monthly') {
    const d = new Date(dateStr + 'T12:00:00')
    if (type === 'monthly') return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function JournalPanel() {
    const [mode, setMode] = useState<Mode>('weekly')
    const [entries, setEntries] = useState<JournalEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [form, setForm] = useState({ went_well: '', to_improve: '', grateful_for: '' })

    const today = new Date().toISOString().split('T')[0]

    useEffect(() => { loadEntries() }, [mode])

    async function loadEntries() {
        setLoading(true)
        const { data } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('type', mode)
            .order('entry_date', { ascending: false })
        setEntries(data || [])
        setLoading(false)
    }

    async function saveEntry() {
        if (!form.went_well.trim() && !form.to_improve.trim() && !form.grateful_for.trim()) return
        setSaving(true)
        const { data } = await supabase.from('journal_entries').insert({
            type: mode,
            entry_date: today,
            went_well: form.went_well.trim(),
            to_improve: form.to_improve.trim(),
            grateful_for: form.grateful_for.trim(),
        }).select().single()
        if (data) setEntries(p => [data, ...p])
        setForm({ went_well: '', to_improve: '', grateful_for: '' })
        setSaving(false)
    }

    const todayEntry = entries.find(e => e.entry_date === today)

    return (
        <FeaturePanel title="Journal" color="#cc66ff">

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '36px' }}>
                {(['weekly', 'monthly'] as Mode[]).map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        style={{
                            background: mode === m ? 'rgba(204,102,255,0.12)' : 'transparent',
                            border: `1px solid ${mode === m ? 'rgba(204,102,255,0.45)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '4px', padding: '7px 18px',
                            color: mode === m ? '#cc66ff' : '#8888aa',
                            fontFamily: 'var(--font-display)', fontSize: '10px',
                            letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer',
                        }}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Write section — show if no entry today */}
            {!todayEntry ? (
                <div style={{ marginBottom: '48px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#cc66ff', marginBottom: '24px', opacity: 0.8 }}>
                        {mode === 'weekly' ? "this week's reflection" : "this month's reflection"}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {PROMPTS.map(p => (
                            <div key={p.key}>
                                <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8888aa', marginBottom: '8px' }}>
                                    {p.label}
                                </label>
                                <textarea
                                    value={form[p.key as keyof typeof form]}
                                    onChange={e => setForm(prev => ({ ...prev, [p.key]: e.target.value }))}
                                    placeholder={p.placeholder}
                                    rows={3}
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.7,
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '8px', padding: '14px 16px',
                                        color: '#f0f0f0', outline: 'none', resize: 'vertical',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(204,102,255,0.3)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={saveEntry}
                        disabled={saving || (!form.went_well.trim() && !form.to_improve.trim() && !form.grateful_for.trim())}
                        style={{
                            marginTop: '20px',
                            background: 'transparent',
                            border: '1px solid rgba(204,102,255,0.4)',
                            borderRadius: '6px', padding: '12px 32px',
                            color: '#cc66ff', fontFamily: 'var(--font-display)',
                            fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase',
                            cursor: 'pointer', transition: 'all 0.2s',
                            opacity: (form.went_well || form.to_improve || form.grateful_for) ? 1 : 0.4,
                        }}
                    >
                        {saving ? 'saving...' : 'save entry'}
                    </button>
                </div>
            ) : (
                <div style={{ marginBottom: '48px', padding: '16px 20px', background: 'rgba(204,102,255,0.06)', border: '1px solid rgba(204,102,255,0.2)', borderRadius: '8px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#cc66ff', opacity: 0.8 }}>
                        ✓ already written today
                    </p>
                </div>
            )}

            {/* Past entries timeline */}
            <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8888aa', marginBottom: '20px' }}>
                    past entries
                </p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#8888aa', fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.3em' }}>loading...</div>
                ) : entries.filter(e => e.entry_date !== today).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#8888aa', fontFamily: 'var(--font-body)', fontSize: '13px', opacity: 0.6 }}>no past entries yet</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {entries.filter(e => e.entry_date !== today).map(entry => {
                            const isOpen = expandedId === entry.id
                            return (
                                <div key={entry.id}>
                                    {/* Entry row */}
                                    <button
                                        onClick={() => setExpandedId(isOpen ? null : entry.id)}
                                        style={{
                                            width: '100%', textAlign: 'left',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '14px 18px',
                                            background: isOpen ? 'rgba(204,102,255,0.06)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${isOpen ? 'rgba(204,102,255,0.2)' : 'rgba(255,255,255,0.04)'}`,
                                            borderRadius: isOpen ? '8px 8px 0 0' : '8px',
                                            cursor: 'pointer', transition: 'all 0.15s',
                                        }}
                                    >
                                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#f0f0f0' }}>
                                            {formatEntryDate(entry.entry_date, entry.type)}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: '#cc66ff', opacity: 0.6, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>›</span>
                                    </button>

                                    {/* Expanded content */}
                                    {isOpen && (
                                        <div style={{
                                            background: 'rgba(204,102,255,0.03)',
                                            border: '1px solid rgba(204,102,255,0.15)',
                                            borderTop: 'none',
                                            borderRadius: '0 0 8px 8px',
                                            padding: '20px 20px 24px',
                                            display: 'flex', flexDirection: 'column', gap: '18px',
                                        }}>
                                            {PROMPTS.map(p => {
                                                const val = entry[p.key as keyof JournalEntry] as string
                                                if (!val) return null
                                                return (
                                                    <div key={p.key}>
                                                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#cc66ff', opacity: 0.7, marginBottom: '8px' }}>{p.label}</p>
                                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.7, color: '#c0c0d0', whiteSpace: 'pre-wrap' }}>{val}</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </FeaturePanel>
    )
}