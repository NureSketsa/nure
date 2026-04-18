// FILE LOCATION: components/features/HabitsPanel.tsx
// Self-contained habits feature. Has its own state and Supabase calls.
// Rendered as an overlay on top of the universe canvas.
// To work on just this file, you only need this + FeaturePanel + supabase lib.

'use client'

import { useState, useEffect } from 'react'
import FeaturePanel from '@/components/layout/FeaturePanel'
import { supabase } from '@/lib/supabase'

interface Habit { id: string; name: string; icon: string; created_at: string }
interface HabitLog { id: string; habit_id: string; completed_date: string }

function computeStreak(logs: HabitLog[], habitId: string): number {
    const dates = logs.filter(l => l.habit_id === habitId).map(l => l.completed_date).sort().reverse()
    if (!dates.length) return 0
    let streak = 0
    const today = new Date()
    for (let i = 0; i < dates.length; i++) {
        const expected = new Date(today)
        expected.setDate(today.getDate() - i)
        if (dates[i] === expected.toISOString().split('T')[0]) streak++
        else break
    }
    return streak
}

export default function HabitsPanel() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [allLogs, setAllLogs] = useState<HabitLog[]>([])
    const [newHabit, setNewHabit] = useState('')
    const [newIcon, setNewIcon] = useState('✦')
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)

    const today = new Date().toISOString().split('T')[0]

    useEffect(() => { loadData() }, [])

    async function loadData() {
        setLoading(true)
        const [{ data: h }, { data: tl }, { data: al }] = await Promise.all([
            supabase.from('habits').select('*').order('created_at'),
            supabase.from('habit_logs').select('*').eq('completed_date', today),
            supabase.from('habit_logs').select('*').order('completed_date', { ascending: false }),
        ])
        setHabits(h || [])
        setLogs(tl || [])
        setAllLogs(al || [])
        setLoading(false)
    }

    const isChecked = (id: string) => logs.some(l => l.habit_id === id)

    async function toggleHabit(habit: Habit) {
        if (isChecked(habit.id)) {
            const log = logs.find(l => l.habit_id === habit.id)!
            await supabase.from('habit_logs').delete().eq('id', log.id)
            setLogs(p => p.filter(l => l.id !== log.id))
            setAllLogs(p => p.filter(l => l.id !== log.id))
        } else {
            const { data } = await supabase.from('habit_logs').insert({ habit_id: habit.id, completed_date: today }).select().single()
            if (data) { setLogs(p => [...p, data]); setAllLogs(p => [...p, data]) }
        }
    }

    async function addHabit() {
        if (!newHabit.trim()) return
        setAdding(true)
        const { data } = await supabase.from('habits').insert({ name: newHabit.trim(), icon: newIcon }).select().single()
        if (data) setHabits(p => [...p, data])
        setNewHabit(''); setNewIcon('✦'); setAdding(false)
    }

    async function deleteHabit(id: string) {
        await supabase.from('habit_logs').delete().eq('habit_id', id)
        await supabase.from('habits').delete().eq('id', id)
        setHabits(p => p.filter(h => h.id !== id))
        setLogs(p => p.filter(l => l.habit_id !== id))
        setAllLogs(p => p.filter(l => l.habit_id !== id))
    }

    const completed = habits.filter(h => isChecked(h.id)).length

    return (
        <FeaturePanel title="Daily Habits" color="#f5c842">
            {/* Progress */}
            <div style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8888aa' }}>today</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: '#f5c842' }}>{completed} / {habits.length}</span>
                </div>
                <div style={{ height: '2px', background: '#1a1a2e', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: habits.length ? `${(completed / habits.length) * 100}%` : '0%', background: 'linear-gradient(90deg, #f5a623, #ffdd77)', transition: 'width 0.5s ease' }} />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8888aa', fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.3em' }}>loading...</div>
            ) : habits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8888aa', fontFamily: 'var(--font-body)', fontSize: '14px' }}>no habits yet — add one below</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                    {habits.map(habit => {
                        const checked = isChecked(habit.id)
                        const streak = computeStreak(allLogs, habit.id)
                        return (
                            <div key={habit.id} className="habit-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '15px 18px', background: checked ? 'rgba(245,200,66,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${checked ? 'rgba(245,200,66,0.2)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '8px', transition: 'all 0.2s', position: 'relative' }}>
                                <button onClick={() => toggleHabit(habit)} style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '5px', border: checked ? '1px solid #f5c842' : '1px solid rgba(255,255,255,0.18)', background: checked ? '#f5c842' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                    {checked && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="#05050f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                </button>
                                <span style={{ fontSize: '20px', flexShrink: 0 }}>{habit.icon}</span>
                                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '14px', color: checked ? '#f5c842' : '#f0f0f0', textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.7 : 1, transition: 'all 0.2s' }}>{habit.name}</span>
                                {streak > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: streak >= 7 ? 'rgba(245,200,66,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${streak >= 7 ? 'rgba(245,200,66,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '20px' }}>
                                        <span style={{ fontSize: '11px' }}>🔥</span>
                                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: streak >= 7 ? '#f5c842' : '#8888aa' }}>{streak}</span>
                                    </div>
                                )}
                                <button onClick={() => deleteHabit(habit.id)} className="del-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', fontSize: '18px', lineHeight: 1, opacity: 0, transition: 'opacity 0.2s' }}>×</button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '20px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8888aa', marginBottom: '14px' }}>add habit</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" value={newIcon} onChange={e => setNewIcon(e.target.value)} maxLength={2} style={{ width: '48px', textAlign: 'center', fontSize: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px', color: '#f0f0f0', outline: 'none', flexShrink: 0 }} />
                    <input type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()} placeholder="habit name" style={{ flex: 1, fontSize: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 14px', color: '#f0f0f0', fontFamily: 'var(--font-body)', outline: 'none' }} />
                    <button onClick={addHabit} disabled={adding || !newHabit.trim()} style={{ background: 'transparent', border: '1px solid rgba(245,200,66,0.35)', borderRadius: '6px', padding: '10px 22px', color: '#f5c842', fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: newHabit.trim() ? 'pointer' : 'default', opacity: newHabit.trim() ? 1 : 0.4 }}>{adding ? '...' : 'add'}</button>
                </div>
            </div>

            <style jsx>{`.habit-row:hover .del-btn { opacity: 1 !important; }`}</style>
        </FeaturePanel>
    )
}