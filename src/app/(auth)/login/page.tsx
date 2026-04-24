'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { z } from 'zod'

const authSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
})

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const errorParam = searchParams.get('error')
        if (errorParam === 'auth_callback_failed') {
            setError('Authentication failed. Please try logging in again.')
        } else if (errorParam) {
            setError(decodeURIComponent(errorParam))
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Validate inputs for login
            const parsed = authSchema.safeParse({ email, password })
            if (!parsed.success) {
                setError(parsed.error.issues[0].message)
                setLoading(false)
                return
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            
            if (signInError) {
                setError(signInError.message)
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-sm mx-auto px-4">
            <div className="text-center mb-8">
                <Link href="/" className="inline-block mb-6">
                    <Image
                        src="/logo.svg"
                        alt="hky.bio"
                        width={48}
                        height={48}
                        className="mx-auto"
                    />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-sm text-hky-muted mt-2">
                    Sign in to manage your hky.bio profile
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-xs font-medium text-hky-muted mb-1.5">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-ice-600/50 focus:border-ice-600/50 transition-all disabled:opacity-50"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="password" className="block text-xs font-medium text-hky-muted">
                            Password
                        </label>
                        <Link href="/forgot-password" disabled={false} className="text-xs text-white/60 hover:text-white transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                            className="w-full pl-3 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-ice-600/50 focus:border-ice-600/50 transition-all disabled:opacity-50"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors focus:outline-none"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-2.5 bg-white hover:bg-white/90 text-hky-black text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : null}
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <p className="text-center text-sm text-hky-muted mt-6">
                Don&apos;t have an account?{' '}
                <Link
                    href="/register"
                    className="text-white hover:underline font-medium focus:outline-none"
                >
                    Sign up
                </Link>
            </p>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-sm mx-auto px-4 flex justify-center py-12">
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
