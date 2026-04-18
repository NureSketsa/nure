// FILE LOCATION: components/features/LinksPanel.tsx
// Self-contained links feature. Has its own state and Supabase calls.
// To work on just this file, you only need this + FeaturePanel + supabase lib.

'use client'

import { useState, useEffect } from 'react'
import FeaturePanel from '@/components/layout/FeaturePanel'
import { supabase } from '@/lib/supabase'

interface Link { id: string; title: string; url: string; category: string; emoji: string; created_at: string }

const CATEGORIES = ['School', 'Tools', 'Social', 'Entertainment', 'Other']
const CAT_COLOR: Record<string, string> = { School: '#4488ff', Tools: '#00d4aa', Social: '#f5a623', Entertainment: '#cc66ff', Other: '#8888aa' }

export default function LinksPanel() {
    const [links, setLinks] = useState<Link[]>([])
    const [filter, setFilter] = useState('All')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', url: '', category: 'Tools', emoji: '🔗' })
    const [saving, setSaving] = useState(false)

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const { data } = await supabase.from('links').select('*').order('created_at')
        setLinks(data || [])
        setLoading(false)
    }

    async function addLink() {
        if (!form.title.trim() || !form.url.trim()) return
        setSaving(true)
        let url = form.url.trim()
        if (!url.startsWith('http')) url = 'https://' + url
        const { data } = await supabase.from('links').insert({ ...form, url }).select().single()
        if (data) setLinks(p => [...p, data])
        setForm({ title: '', url: '', category: 'Tools', emoji: '🔗' })
        setShowForm(false); setSaving(false)
    }

    async function deleteLink(id: string) {
        await supabase.from('links').delete().eq('id', id)
        setLinks(p => p.filter(l => l.id !== id))
    }

    const filtered = filter === 'All' ? links : links.filter(l => l.category === filter)

    return (
        <FeaturePanel title="Link Hub" color="#4488ff">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
                {['All', ...CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} style={{ background: filter === cat ? 'rgba(68,136,255,0.12)' : 'transparent', border: `1px solid ${filter === cat ? 'rgba(68,136,255,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '4px', padding: '6px 14px', color: filter === cat ? '#4488ff' : '#8888aa', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>{cat}</button>
                ))}
                <button onClick={() => setShowForm(true)} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(245,168,35,0.35)', borderRadius: '4px', padding: '6px 16px', color: '#f5a623', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>+ add link</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8888aa', fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.3em' }}>loading...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8888aa', fontFamily: 'var(--font-body)', fontSize: '14px' }}>no links here — add one above</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {filtered.map(link => {
                        const cc = CAT_COLOR[link.category] || '#8888aa'
                        return (
                            <div key={link.id} className="link-card" style={{ position: 'relative' }}>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '18px', textDecoration: 'none', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'none' }}
                                >
                                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>{link.emoji}</div>
                                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#f0f0f0', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.title}</div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: cc, opacity: 0.8 }}>{link.category}</div>
                                </a>
                                <button onClick={() => deleteLink(link.id)} className="del-btn" style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '4px', width: '22px', height: '22px', cursor: 'pointer', color: '#ff4444', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>×</button>
                            </div>
                        )
                    })}
                </div>
            )}

            {showForm && (
                <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,5,15,0.9)', backdropFilter: 'blur(8px)', zIndex: 60 }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                    <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px', width: '420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#4488ff', marginBottom: '4px' }}>new link</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} maxLength={2} style={{ width: '48px', textAlign: 'center', fontSize: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px', color: '#f0f0f0', outline: 'none', flexShrink: 0 }} />
                            <input autoFocus type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="title" style={{ flex: 1, fontSize: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 14px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none' }} />
                        </div>
                        <input type="text" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} onKeyDown={e => e.key === 'Enter' && addLink()} placeholder="url" style={{ width: '100%', fontSize: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 14px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }} />
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', fontSize: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 12px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}>
                            {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0d0d1a' }}>{c}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#8888aa', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>cancel</button>
                            <button onClick={addLink} disabled={saving || !form.title.trim() || !form.url.trim()} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(68,136,255,0.4)', borderRadius: '6px', color: '#4488ff', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: (form.title.trim() && form.url.trim()) ? 'pointer' : 'default', opacity: (form.title.trim() && form.url.trim()) ? 1 : 0.4 }}>{saving ? '...' : 'save'}</button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`.link-card:hover .del-btn { opacity: 1 !important; }`}</style>
        </FeaturePanel>
    )
}