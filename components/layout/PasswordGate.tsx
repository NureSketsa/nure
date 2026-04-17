// FILE LOCATION: components/layout/PasswordGate.tsx
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
        // Generate static star field
        const generated = Array.from({ length: 150 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.7 + 0.3,
        }))
        setStars(generated)
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
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ background: '#05050f' }}
        >
            {/* Star field */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {stars.map((star, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Subtle radial glow behind the form */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,166,35,0.04) 0%, transparent 70%)',
                }}
            />

            {/* Gate card */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-8">
                {/* Logo */}
                <div className="flex flex-col items-center gap-2">
                    <h1
                        className="text-6xl font-black tracking-widest"
                        style={{
                            fontFamily: 'var(--font-display)',
                            color: '#f5a623',
                            textShadow: '0 0 40px rgba(245,166,35,0.4), 0 0 80px rgba(245,166,35,0.15)',
                            letterSpacing: '0.3em',
                        }}
                    >
                        NURE
                    </h1>
                    <p
                        className="text-sm tracking-[0.4em] uppercase"
                        style={{ color: '#8888aa', fontFamily: 'var(--font-body)' }}
                    >
                        light in the void
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-72">
                    <div
                        className="w-full relative"
                        style={{
                            transform: shake ? 'translateX(0)' : undefined,
                            animation: shake ? 'shake 0.4s ease-in-out' : undefined,
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="enter passphrase"
                            className="w-full text-center text-sm tracking-widest outline-none transition-all duration-300"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: error
                                    ? '1px solid rgba(255,68,68,0.6)'
                                    : '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '4px',
                                padding: '14px 20px',
                                color: '#f0f0f0',
                                fontFamily: 'var(--font-display)',
                                fontSize: '13px',
                                letterSpacing: '0.25em',
                                boxShadow: error
                                    ? '0 0 20px rgba(255,68,68,0.15)'
                                    : '0 0 20px rgba(245,166,35,0.05)',
                            }}
                        />
                    </div>

                    {error && (
                        <p
                            className="text-xs tracking-widest uppercase"
                            style={{ color: '#ff4444', fontFamily: 'var(--font-body)', opacity: 0.8 }}
                        >
                            access denied
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 text-xs tracking-[0.3em] uppercase transition-all duration-200 hover:opacity-100"
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(245,166,35,0.3)',
                            borderRadius: '4px',
                            color: '#f5a623',
                            fontFamily: 'var(--font-display)',
                            opacity: 0.7,
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(245,166,35,0.08)'
                            e.currentTarget.style.opacity = '1'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.opacity = '0.7'
                        }}
                    >
                        enter
                    </button>
                </form>
            </div>

            <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
        </div>
    )
}