// FILE LOCATION: app/habits/page.tsx
// This is the HABITS feature page.
// Create a folder called "habits" inside your "app" folder, then put this file inside it.
// URL: nure.vercel.app/habits

'use client'

import { useState, useEffect } from 'react'
import FeatureLayout from '@/components/layout/FeatureLayout'
import { supabase } from '@/lib/supabase'

interface Habit {
    id: string
    name: string
    icon: string
    created_at: string
}

interface HabitLog {
    id: string
    habit_id: string
    completed_date: string
}

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [newHabit, setNewHabit] = useState('')
    const [newIcon, setNewIcon] = useState('✦')
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)

    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const [{ data: habitsData }, { data: logsData }] = await Promise.all([
            supabase.from('habits').select('*').order('created_at'),
            supabase.from('habit_logs').select('*').eq('completed_date', today),
        ])
        setHabits(habitsData || [])
        setLogs(logsData || [])
        setLoading(false)
    }

    function isChecked(habitId: string) {
        return logs.some((l) => l.habit_id === habitId)
    }

    async function toggleHabit(habit: Habit) {
        const checked = isChecked(habit.id)
        if (checked) {
            const log = logs.find((l) => l.habit_id === habit.id)
            if (!log) return
            await supabase.from('habit_logs').delete().eq('id', log.id)
            setLogs((prev) => prev.filter((l) => l.id !== log.id))
        } else {
            const { data } = await supabase
                .from('habit_logs')
                .insert({ habit_id: habit.id, completed_date: today })
                .select()
                .single()
            if (data) setLogs((prev) => [...prev, data])
        }
    }

    async function addHabit() {
        if (!newHabit.trim()) return
        setAdding(true)
        const { data } = await supabase
            .from('habits')
            .insert({ name: newHabit.trim(), icon: newIcon })
            .select()
            .single()
        if (data) setHabits((prev) => [...prev, data])
        setNewHabit('')
        setNewIcon('✦')
        setAdding(false)
    }

    async function deleteHabit(id: string) {
        await supabase.from('habit_logs').delete().eq('habit_id', id)
        await supabase.from('habits').delete().eq('id', id)
        setHabits((prev) => prev.filter((h) => h.id !== id))
        setLogs((prev) => prev.filter((l) => l.habit_id !== id))
    }

    const completedCount = habits.filter((h) => isChecked(h.id)).length

    return (
        <FeatureLayout title="Daily Habits" icon="⭐">
            {/* Progress */}
            <div className="mb-10">
                <div className="flex items-baseline justify-between mb-3">
                    <span
                        className="text-xs tracking-widest uppercase"
                        style={{ color: '#8888aa', fontFamily: 'var(--font-display)' }}
                    >
                        today's progress
                    </span>
                    <span
                        className="text-sm"
                        style={{ color: '#f5a623', fontFamily: 'var(--font-display)' }}
                    >
                        {completedCount} / {habits.length}
                    </span>
                </div>
                <div
                    className="h-px w-full relative overflow-hidden"
                    style={{ background: '#1a1a2e' }}
                >
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: habits.length ? `${(completedCount / habits.length) * 100}%` : '0%',
                            background: 'linear-gradient(90deg, #f5a623, #ffcc66)',
                        }}
                    />
                </div>
            </div>

            {/* Habits list */}
            {loading ? (
                <div
                    className="text-xs tracking-widest text-center py-20"
                    style={{ color: '#8888aa', fontFamily: 'var(--font-display)' }}
                >
                    loading...
                </div>
            ) : habits.length === 0 ? (
                <div
                    className="text-center py-20"
                    style={{ color: '#8888aa', fontFamily: 'var(--font-body)' }}
                >
                    <p className="text-sm mb-2">no habits yet</p>
                    <p className="text-xs opacity-60">add your first habit below</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2 mb-10">
                    {habits.map((habit) => {
                        const checked = isChecked(habit.id)
                        return (
                            <div
                                key={habit.id}
                                className="flex items-center gap-4 group transition-all duration-200"
                                style={{
                                    background: checked ? 'rgba(245,166,35,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${checked ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                    borderRadius: '6px',
                                    padding: '16px 20px',
                                }}
                            >
                                <button
                                    onClick={() => toggleHabit(habit)}
                                    className="flex-shrink-0 transition-all duration-200"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '4px',
                                        border: checked ? '1px solid #f5a623' : '1px solid rgba(255,255,255,0.15)',
                                        background: checked ? '#f5a623' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    {checked && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="#05050f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </button>

                                <span style={{ fontSize: '18px', flexShrink: 0 }}>{habit.icon}</span>

                                <span
                                    className="flex-1 text-sm transition-all duration-200"
                                    style={{
                                        fontFamily: 'var(--font-body)',
                                        color: checked ? '#f5a623' : '#f0f0f0',
                                        textDecoration: checked ? 'line-through' : 'none',
                                        opacity: checked ? 0.7 : 1,
                                    }}
                                >
                                    {habit.name}
                                </span>

                                <button
                                    onClick={() => deleteHabit(habit.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#ff4444',
                                        fontSize: '16px',
                                        padding: '0 4px',
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

            {/* Add habit */}
            <div
                style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '20px',
                }}
            >
                <p
                    className="text-xs tracking-widest uppercase mb-4"
                    style={{ color: '#8888aa', fontFamily: 'var(--font-display)' }}
                >
                    add habit
                </p>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newIcon}
                        onChange={(e) => setNewIcon(e.target.value)}
                        maxLength={2}
                        className="text-center text-lg outline-none"
                        style={{
                            width: '48px',
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
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                        placeholder="habit name"
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
                    <button
                        onClick={addHabit}
                        disabled={adding || !newHabit.trim()}
                        className="text-xs tracking-widest uppercase transition-all duration-200"
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(245,166,35,0.3)',
                            borderRadius: '6px',
                            padding: '10px 20px',
                            color: '#f5a623',
                            fontFamily: 'var(--font-display)',
                            cursor: newHabit.trim() ? 'pointer' : 'default',
                            opacity: newHabit.trim() ? 1 : 0.4,
                        }}
                    >
                        {adding ? '...' : 'add'}
                    </button>
                </div>
            </div>
        </FeatureLayout>
    )
}