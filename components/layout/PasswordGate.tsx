// FILE LOCATION: components/layout/PasswordGate.tsx
// Full screen password gate shown before the universe loads.

'use client'

import { useState, useEffect, useRef } from 'react'
import { authenticate } from '@/lib/auth'

interface PasswordGateProps {
    onSuccess: () => void
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [shake, setShake] = useState(false)
    const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number }[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setStars(Array.from({ length: 150 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.7 + 0.3,
        })))
        inputRef.current?.focus()
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (authenticate(password)) {
            onSuccess()
        } else {
            setError(true)
            setShake(true)
            setPassword('')
            setTimeout(() => setShake(false), 500)
            setTimeout(() => setError(false), 2000)
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05050f' }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {stars.map((star, i) => (
                    <div key={i} style={{
                        position: 'absolute', borderRadius: '50%', background: 'white',
                        left: `${star.x}%`, top: `${star.y}%`,
                        width: `${star.size}px`, height: `${star.size}px`, opacity: star.opacity,
                    }} />
                ))}
            </div>

            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '60px', fontWeight: 900, letterSpacing: '0.3em', color: '#f5a623', textShadow: '0 0 40px rgba(245,166,35,0.4)', margin: 0 }}>NURE</h1>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#8888aa' }}>light in the void</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '280px' }}>
                    <div style={{ animation: shake ? 'shake 0.4s ease' : undefined, width: '100%' }}>
                        <input
                            ref={inputRef}
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="enter passphrase"
                            style={{
                                width: '100%', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '13px',
                                letterSpacing: '0.25em', background: 'rgba(255,255,255,0.03)', outline: 'none',
                                border: `1px solid ${error ? 'rgba(255,68,68,0.6)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: '4px', padding: '14px 20px', color: '#f0f0f0',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    {error && <p style={{ color: '#ff4444', fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>access denied</p>}
                    <button type="submit" style={{
                        width: '100%', padding: '12px', background: 'transparent',
                        border: '1px solid rgba(245,166,35,0.3)', borderRadius: '4px',
                        color: '#f5a623', fontFamily: 'var(--font-display)', fontSize: '11px',
                        letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer',
                    }}>
                        enter
                    </button>
                </form>
            </div>

            <style jsx>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
        </div>
    )
}