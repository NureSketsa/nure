// FILE LOCATION: app/links/page.tsx
// This is the LINK HUB feature page.
// Create a folder called "links" inside your "app" folder, then put this file inside it.
// URL: nure.vercel.app/links

'use client'

import { useState, useEffect } from 'react'
import FeatureLayout from '@/components/layout/FeatureLayout'
import { supabase } from '@/lib/supabase'

interface Link {
    id: string
    title: string
    url: string
    category: string
    emoji: string
    created_at: string
}

const CATEGORIES = ['School', 'Tools', 'Social', 'Entertainment', 'Other']

const CATEGORY_COLORS: Record<string, string> = {
    School: '#4444ff',
    Tools: '#00d4aa',
    Social: '#f5a623',
    Entertainment: '#7b2d8b',
    Other: '#8888aa',
}

export default function LinksPage() {
    const [links, setLinks] = useState<Link[]>([])
    const [filter, setFilter] = useState('All')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', url: '', category: 'Tools', emoji: '🔗' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadLinks()
    }, [])

    async function loadLinks() {
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

        const { data } = await supabase
            .from('links')
            .insert({ ...form, url })
            .select()
            .single()

        if (data) setLinks((prev) => [...prev, data])
        setForm({ title: '', url: '', category: 'Tools', emoji: '🔗' })
        setShowForm(false)
        setSaving(false)
    }

    async function deleteLink(id: string) {
        await supabase.from('links').delete().eq('id', id)
        setLinks((prev) => prev.filter((l) => l.id !== id))
    }

    const allCategories = ['All', ...CATEGORIES]
    const filtered = filter === 'All' ? links : links.filter((l) => l.category === filter)

    return (
        <FeatureLayout title="Link Hub" icon="🔵">
            {/* Filter tabs */}
            <div className="flex gap-2 mb-8 flex-wrap">
                {allCategories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className="text-xs tracking-widest uppercase transition-all duration-200"
                        style={{
                            background: filter === cat ? 'rgba(68,68,255,0.15)' : 'transparent',
                            border: `1px solid ${filter === cat ? 'rgba(68,68,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '4px',
                            padding: '6px 14px',
                            color: filter === cat ? '#8888ff' : '#8888aa',
                            fontFamily: 'var(--font-display)',
                            cursor: 'pointer',
                        }}
                    >
                        {cat}
                    </button>
                ))}

                <button
                    onClick={() => setShowForm(true)}
                    className="ml-auto text-xs tracking-widest uppercase transition-all duration-200"
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(245,166,35,0.3)',
                        borderRadius: '4px',
                        padding: '6px 14px',
                        color: '#f5a623',
                        fontFamily: 'var(--font-display)',
                        cursor: 'pointer',
                    }}
                >
                    + add link
                </button>
            </div>

            {/* Links grid */}
            {loading ? (
                <div
                    className="text-xs tracking-widest text-center py-20"
                    style={{ color: '#8888aa', fontFamily: 'var(--font-display)' }}
                >
                    loading...
                </div>
            ) : filtered.length === 0 ? (
                <div
                    className="text-center py-20"
                    style={{ color: '#8888aa', fontFamily: 'var(--font-body)' }}
                >
                    <p className="text-sm mb-2">no links here</p>
                    <p className="text-xs opacity-60">add your first link above</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {filtered.map((link) => {
                        const catColor = CATEGORY_COLORS[link.category] || '#8888aa'
                        return (
                            <div key={link.id} className="group relative">
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block transition-all duration-200"
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '8px',
                                        padding: '18px',
                                        textDecoration: 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                        e.currentTarget.style.borderColor = `${catColor}40`
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                    }}
                                >
                                    <div className="text-2xl mb-3">{link.emoji}</div>
                                    <div
                                        className="text-sm font-medium mb-1 truncate"
                                        style={{ color: '#f0f0f0', fontFamily: 'var(--font-body)' }}
                                    >
                                        {link.title}
                                    </div>
                                    <div
                                        className="text-xs"
                                        style={{ color: catColor, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', opacity: 0.7 }}
                                    >
                                        {link.category}
                                    </div>
                                </a>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        deleteLink(link.id)
                                    }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    style={{
                                        background: 'rgba(255,68,68,0.15)',
                                        border: '1px solid rgba(255,68,68,0.3)',
                                        borderRadius: '4px',
                                        width: '22px',
                                        height: '22px',
                                        cursor: 'pointer',
                                        color: '#ff4444',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        lineHeight: 1,
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add form modal */}
            {showForm && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(8px)' }}
                    onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
                >
                    <div
                        style={{
                            background: '#0d0d1a',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            padding: '32px',
                            width: '420px',
                        }}
                    >
                        <h2
                            className="text-xs tracking-widest uppercase mb-6"
                            style={{ color: '#f5a623', fontFamily: 'var(--font-display)' }}
                        >
                            new link
                        </h2>

                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={form.emoji}
                                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                                    maxLength={2}
                                    className="text-center text-xl outline-none"
                                    style={{
                                        width: '52px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '6px',
                                        padding: '10px',
                                        color: '#f0f0f0',
                                        flexShrink: 0,
                                    }}
                                />
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="title"
                                    className="flex-1 text-sm outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '6px',
                                        padding: '10px 14px',
                                        color: '#f0f0f0',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                />
                            </div>

                            <input
                                type="text"
                                value={form.url}
                                onChange={(e) => setForm({ ...form, url: e.target.value })}
                                placeholder="url"
                                className="w-full text-sm outline-none"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '6px',
                                    padding: '10px 14px',
                                    color: '#f0f0f0',
                                    fontFamily: 'var(--font-body)',
                                }}
                            />

                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full text-sm outline-none"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '6px',
                                    padding: '10px 14px',
                                    color: '#f0f0f0',
                                    fontFamily: 'var(--font-body)',
                                    cursor: 'pointer',
                                }}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c} style={{ background: '#0d0d1a' }}>
                                        {c}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-3 mt-2">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 text-xs tracking-widest uppercase py-3"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '6px',
                                        color: '#8888aa',
                                        fontFamily: 'var(--font-display)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    cancel
                                </button>
                                <button
                                    onClick={addLink}
                                    disabled={saving || !form.title.trim() || !form.url.trim()}
                                    className="flex-1 text-xs tracking-widest uppercase py-3"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(245,166,35,0.4)',
                                        borderRadius: '6px',
                                        color: '#f5a623',
                                        fontFamily: 'var(--font-display)',
                                        cursor: form.title.trim() && form.url.trim() ? 'pointer' : 'default',
                                        opacity: form.title.trim() && form.url.trim() ? 1 : 0.4,
                                    }}
                                >
                                    {saving ? '...' : 'save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </FeatureLayout>
    )
}