'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
})

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const parsed = forgotPasswordSchema.safeParse({ email })
            if (!parsed.success) {
                setError(parsed.error.issues[0].message)
                setLoading(false)
                return
            }

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            })

            if (resetError) {
                setError(resetError.message)
            } else {
                setMessage('If an account exists for this email, a password reset link has been sent.')
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
                        src="/logo-white.svg"
                        alt="hky.bio"
                        width={48}
                        height={48}
                        className="mx-auto"
                        priority
                    />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">
                    Reset your password
                </h1>
                <p className="text-sm text-hky-muted mt-2">
                    Enter your email address and we'll send you a link to reset your password.
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
                    className="w-full flex items-center justify-center py-2.5 bg-white hover:bg-white/90 text-hky-black text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : null}
                    {loading ? 'Sending link...' : 'Send reset link'}
                </button>
            </form>

            <p className="text-center text-sm text-hky-muted mt-6">
                Remember your password?{' '}
                <Link href="/login" className="text-white hover:underline font-medium">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
