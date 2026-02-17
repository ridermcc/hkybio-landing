'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) {
                setError(error.message)
            } else {
                setMessage('Check your email for the confirmation link.')
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                setError(error.message)
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        }

        setLoading(false)
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
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="text-sm text-hky-muted mt-2">
                    {isSignUp
                        ? 'Sign up to start building your profile'
                        : 'Sign in to manage your hky.bio profile'}
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
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-ice-600/50 focus:border-ice-600/50 transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-xs font-medium text-hky-muted mb-1.5">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-ice-600/50 focus:border-ice-600/50 transition-all"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-ice-600 hover:bg-ice-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading
                        ? 'Loading...'
                        : isSignUp
                            ? 'Create account'
                            : 'Sign in'}
                </button>
            </form>

            <p className="text-center text-sm text-hky-muted mt-6">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                    onClick={() => {
                        setIsSignUp(!isSignUp)
                        setError(null)
                        setMessage(null)
                    }}
                    className="text-ice-600 hover:underline font-medium"
                >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
            </p>
        </div>
    )
}
