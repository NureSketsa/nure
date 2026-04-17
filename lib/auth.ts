// FILE LOCATION: lib/auth.ts
export const AUTH_KEY = 'nure_auth'

export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(AUTH_KEY) === 'true'
}

export function authenticate(password: string): boolean {
    const correct = process.env.NEXT_PUBLIC_NURE_PASSWORD
    if (password === correct) {
        localStorage.setItem(AUTH_KEY, 'true')
        return true
    }
    return false
}

export function logout(): void {
    localStorage.removeItem(AUTH_KEY)
}