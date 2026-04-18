// FILE LOCATION: components/features/TodosPanel.tsx
// Self-contained todos feature. Has its own state and Supabase calls.
// To work on just this file, you only need this + FeaturePanel + supabase lib.

'use client'

import { useState, useEffect } from 'react'
import FeaturePanel from '@/components/layout/FeaturePanel'
import { supabase } from '@/lib/supabase'

interface Todo { id: string; title: string; category: string; due_date: string | null; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'done'; created_at: string }

const CATEGORIES = ['School', 'Personal', 'Organization']
const P_COLOR = { low: '#00d4aa', medium: '#f5a623', high: '#ff4444' }
const P_BG = { low: 'rgba(0,212,170,0.1)', medium: 'rgba(245,168,35,0.1)', high: 'rgba(255,68,68,0.1)' }

export default function TodosPanel() {
    const [todos, setTodos] = useState<Todo[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')
    const [showDone, setShowDone] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', category: 'Personal', priority: 'medium' as Todo['priority'], due_date: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const { data } = await supabase.from('todos').select('*').order('created_at', { ascending: false })
        setTodos(data || [])
        setLoading(false)
    }

    async function toggleDone(todo: Todo) {
        const s = todo.status === 'done' ? 'todo' : 'done'
        await supabase.from('todos').update({ status: s }).eq('id', todo.id)
        setTodos(p => p.map(t => t.id === todo.id ? { ...t, status: s } : t))
    }

    async function deleteTodo(id: string) {
        await supabase.from('todos').delete().eq('id', id)
        setTodos(p => p.filter(t => t.id !== id))
    }

    async function addTodo() {
        if (!form.title.trim()) return
        setSaving(true)
        const { data } = await supabase.from('todos').insert({ ...form, due_date: form.due_date || null, status: 'todo' }).select().single()
        if (data) setTodos(p => [data, ...p])
        setForm({ title: '', category: 'Personal', priority: 'medium', due_date: '' })
        setShowForm(false); setSaving(false)
    }

    const fmt = (d: string | null) => {
        if (!d) return null
        const diff = Math.round((new Date(d).getTime() - new Date().getTime()) / 86400000)
        if (diff === 0) return 'today'
        if (diff === 1) return 'tomorrow'
        if (diff < 0) return `${Math.abs(diff)}d overdue`
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const active = todos.filter(t => t.status === 'todo' && (filter === 'All' || t.category === filter))
    const done = todos.filter(t => t.status === 'done' && (filter === 'All' || t.category === filter))

    return (
        <FeaturePanel title="Todo List" color="#00d4aa">
            {/* Filter + add */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
                {['All', ...CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} style={{ background: filter === cat ? 'rgba(0,212,170,0.12)' : 'transparent', border: `1px solid ${filter === cat ? 'rgba(0,212,170,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '4px', padding: '6px 14px', color: filter === cat ? '#00d4aa' : '#8888aa', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>{cat}</button>
                ))}
                <button onClick={() => setShowForm(true)} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(245,168,35,0.35)', borderRadius: '4px', padding: '6px 16px', color: '#f5a623', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>+ add task</button>
            </div>

            {/* Active */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8888aa', fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.3em' }}>loading...</div>
            ) : active.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8888aa', fontFamily: 'var(--font-body)', fontSize: '14px' }}>all clear ✓</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '28px' }}>
                    {active.map(todo => {
                        const overdue = todo.due_date && new Date(todo.due_date) < new Date(new Date().toDateString())
                        const dateStr = fmt(todo.due_date)
                        return (
                            <div key={todo.id} className="todo-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${overdue ? 'rgba(255,68,68,0.2)' : 'rgba(255,255,255,0.05)'}`, borderLeft: `3px solid ${P_COLOR[todo.priority]}`, borderRadius: '8px', position: 'relative', transition: 'all 0.15s' }}>
                                <button onClick={() => toggleDone(todo)} style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)', background: 'transparent', cursor: 'pointer' }} />
                                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '14px', color: '#f0f0f0' }}>{todo.title}</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8888aa', flexShrink: 0 }}>{todo.category}</span>
                                <span style={{ padding: '2px 8px', borderRadius: '3px', background: P_BG[todo.priority], color: P_COLOR[todo.priority], fontFamily: 'var(--font-display)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>{todo.priority}</span>
                                {dateStr && <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: overdue ? '#ff4444' : '#8888aa', flexShrink: 0 }}>{dateStr}</span>}
                                <button onClick={() => deleteTodo(todo.id)} className="del-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', fontSize: '18px', lineHeight: 1, opacity: 0, transition: 'opacity 0.2s', flexShrink: 0 }}>×</button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Done */}
            {done.length > 0 && (
                <div>
                    <button onClick={() => setShowDone(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#8888aa', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px', padding: 0 }}>
                        <span style={{ display: 'inline-block', transform: showDone ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                        completed ({done.length})
                    </button>
                    {showDone && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {done.map(todo => (
                                <div key={todo.id} className="todo-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', opacity: 0.5, position: 'relative' }}>
                                    <button onClick={() => toggleDone(todo)} style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#f0f0f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>
                                    <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '14px', color: '#8888aa', textDecoration: 'line-through' }}>{todo.title}</span>
                                    <button onClick={() => deleteTodo(todo.id)} className="del-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', fontSize: '18px', opacity: 0, transition: 'opacity 0.2s' }}>×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Form modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,5,15,0.88)', backdropFilter: 'blur(8px)', zIndex: 60 }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                    <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px', width: '460px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#f5a623', marginBottom: '4px' }}>new task</h2>
                        <input autoFocus type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} onKeyDown={e => e.key === 'Enter' && addTodo()} placeholder="task title" style={{ width: '100%', fontSize: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '11px 14px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ flex: 1, fontSize: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 12px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}>
                                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0d0d1a' }}>{c}</option>)}
                            </select>
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Todo['priority'] })} style={{ flex: 1, fontSize: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 12px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}>
                                {['low', 'medium', 'high'].map(p => <option key={p} value={p} style={{ background: '#0d0d1a' }}>{p} priority</option>)}
                            </select>
                        </div>
                        <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} style={{ width: '100%', fontSize: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 14px', color: form.due_date ? '#f0f0f0' : '#8888aa', fontFamily: 'var(--font-body)', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#8888aa', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>cancel</button>
                            <button onClick={addTodo} disabled={saving || !form.title.trim()} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(245,168,35,0.4)', borderRadius: '6px', color: '#f5a623', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: form.title.trim() ? 'pointer' : 'default', opacity: form.title.trim() ? 1 : 0.4 }}>{saving ? '...' : 'save'}</button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`.todo-row:hover { background: rgba(255,255,255,0.04) !important; } .todo-row:hover .del-btn { opacity: 1 !important; }`}</style>
        </FeaturePanel>
    )
}