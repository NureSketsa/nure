// FILE LOCATION: components/features/CalendarPanel.tsx
// Self-contained calendar feature. Has its own state and Supabase calls.
// To work on just this file, you only need this + FeaturePanel + supabase lib.

'use client'

import { useState, useEffect } from 'react'
import FeaturePanel from '@/components/layout/FeaturePanel'
import { supabase } from '@/lib/supabase'

interface CalEvent { id: string; title: string; event_date: string; event_time: string | null; notes: string | null; color: string }

const EVENT_COLORS = ['#f5a623', '#00d4aa', '#7799ff', '#ff4444', '#cc66ff', '#ff8844']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPanel() {
    const [events, setEvents] = useState<CalEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', event_date: '', event_time: '', notes: '', color: '#f5a623' })
    const [saving, setSaving] = useState(false)

    const today = new Date().toISOString().split('T')[0]

    useEffect(() => { loadEvents() }, [currentDate])

    async function loadEvents() {
        setLoading(true)
        const y = currentDate.getFullYear()
        const m = String(currentDate.getMonth() + 1).padStart(2, '0')
        const { data } = await supabase.from('events').select('*').gte('event_date', `${y}-${m}-01`).lte('event_date', `${y}-${m}-31`).order('event_date')
        setEvents(data || [])
        setLoading(false)
    }

    async function addEvent() {
        if (!form.title.trim() || !form.event_date) return
        setSaving(true)
        const { data } = await supabase.from('events').insert({ title: form.title.trim(), event_date: form.event_date, event_time: form.event_time || null, notes: form.notes || null, color: form.color }).select().single()
        if (data) setEvents(p => [...p, data].sort((a, b) => a.event_date.localeCompare(b.event_date)))
        setForm({ title: '', event_date: selectedDay || '', event_time: '', notes: '', color: '#f5a623' })
        setShowForm(false); setSaving(false)
    }

    async function deleteEvent(id: string) {
        await supabase.from('events').delete().eq('id', id)
        setEvents(p => p.filter(e => e.id !== id))
    }

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })

    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    const eventsForDay = (day: number) => {
        const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return events.filter(e => e.event_date === ds)
    }

    const selectedEvents = selectedDay ? events.filter(e => e.event_date === selectedDay) : []

    return (
        <FeaturePanel title="Calendar" color="#7799ff">
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px 16px', color: '#8888aa', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '16px' }}>‹</button>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '12px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#f0f0f0' }}>{monthName}</h2>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px 16px', color: '#8888aa', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '16px' }}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8888aa', padding: '6px 0' }}>{d}</div>)}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '28px' }}>
                {cells.map((day, i) => {
                    if (!day) return <div key={`e${i}`} style={{ minHeight: '72px' }} />
                    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const dayEvs = eventsForDay(day)
                    const isToday = ds === today
                    const isSel = ds === selectedDay
                    return (
                        <div key={day} onClick={() => setSelectedDay(isSel ? null : ds)}
                            style={{ minHeight: '72px', padding: '8px 6px', background: isSel ? 'rgba(119,153,255,0.1)' : isToday ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)', border: `1px solid ${isSel ? 'rgba(119,153,255,0.35)' : isToday ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                            onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isToday ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)' }}
                        >
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: isToday ? '#7799ff' : '#f0f0f0', marginBottom: '4px', fontWeight: isToday ? 700 : 400 }}>{day}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {dayEvs.slice(0, 3).map(ev => <div key={ev.id} style={{ height: '3px', borderRadius: '2px', background: ev.color, opacity: 0.85 }} />)}
                                {dayEvs.length > 3 && <div style={{ fontFamily: 'var(--font-display)', fontSize: '8px', color: '#8888aa' }}>+{dayEvs.length - 3}</div>}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Selected day */}
            {selectedDay && (
                <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7799ff' }}>
                            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        <button onClick={() => { setForm({ ...form, event_date: selectedDay }); setShowForm(true) }} style={{ background: 'transparent', border: '1px solid rgba(119,153,255,0.35)', borderRadius: '4px', padding: '5px 14px', color: '#7799ff', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>+ event</button>
                    </div>
                    {selectedEvents.length === 0 ? (
                        <p style={{ color: '#8888aa', fontFamily: 'var(--font-body)', fontSize: '13px' }}>no events — click + event to add one</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {selectedEvents.map(ev => (
                                <div key={ev.id} className="ev-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: `3px solid ${ev.color}`, position: 'relative' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#f0f0f0', marginBottom: '2px' }}>{ev.title}</p>
                                        {ev.event_time && <p style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: '#8888aa', letterSpacing: '0.1em' }}>{ev.event_time.slice(0, 5)}</p>}
                                        {ev.notes && <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#8888aa', marginTop: '4px' }}>{ev.notes}</p>}
                                    </div>
                                    <button onClick={() => deleteEvent(ev.id)} className="del-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', fontSize: '18px', lineHeight: 1, opacity: 0, transition: 'opacity 0.2s' }}>×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add event modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,5,15,0.9)', backdropFilter: 'blur(8px)', zIndex: 60 }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                    <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px', width: '460px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7799ff', marginBottom: '4px' }}>new event</h2>
                        <input autoFocus type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="event title" style={{ width: '100%', fontSize: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '11px 14px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} style={{ flex: 1, fontSize: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 12px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none', colorScheme: 'dark' }} />
                            <input type="time" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} style={{ flex: 1, fontSize: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 12px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none', colorScheme: 'dark' }} />
                        </div>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="notes (optional)" rows={2} style={{ width: '100%', fontSize: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 14px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8888aa' }}>color</span>
                            {EVENT_COLORS.map(c => <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: form.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />)}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#8888aa', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>cancel</button>
                            <button onClick={addEvent} disabled={saving || !form.title.trim() || !form.event_date} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(119,153,255,0.4)', borderRadius: '6px', color: '#7799ff', fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: (form.title.trim() && form.event_date) ? 'pointer' : 'default', opacity: (form.title.trim() && form.event_date) ? 1 : 0.4 }}>{saving ? '...' : 'save'}</button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`.ev-row:hover .del-btn { opacity: 1 !important; }`}</style>
        </FeaturePanel>
    )
}