'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Step = 'email' | 'username' | 'password' | 'details' | 'submitting' | 'otp' | 'success'

const USERNAME_REGEX = /^[a-z0-9._]+$/
const MIN_LEN = 3
const MAX_LEN = 15

export function RegisterForm({ initialUsername }: { initialUsername: string }) {
    const router = useRouter()
    const supabase = createClient()

    const [step, setStep] = useState<Step>('email')

    // Form Data
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState(initialUsername)
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [team, setTeam] = useState('')
    const [league, setLeague] = useState('')
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])

    // Derived otpCode for submission
    const otpCode = otpDigits.join('')

    // UI State
    const [error, setError] = useState<React.ReactNode | null>(null)
    const [loading, setLoading] = useState(false)
    const [availability, setAvailability] = useState<'idle' | 'available' | 'taken'>('idle')
    const [reservationExpiry, setReservationExpiry] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState<string | null>(null)

    // Refs for auto-focus
    const emailRef = useRef<HTMLInputElement>(null)
    const usernameRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const detailsRef = useRef<HTMLInputElement>(null)
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        if (step === 'email') emailRef.current?.focus()
        if (step === 'username') usernameRef.current?.focus()
        if (step === 'password') passwordRef.current?.focus()
        if (step === 'details') detailsRef.current?.focus()
        if (step === 'otp') otpRefs.current[0]?.focus()
    }, [step])

    const validateUsername = (v: string): string | null => {
        if (!v) return 'Enter a username'
        if (v.length < MIN_LEN) return `At least ${MIN_LEN} characters`
        if (v.length > MAX_LEN) return `Max ${MAX_LEN} characters`
        if (!USERNAME_REGEX.test(v)) return 'Only lowercase letters, numbers, dots & underscores'
        if (v.startsWith('.') || v.startsWith('_')) return 'Must start with a letter or number'
        if (v.endsWith('.') || v.endsWith('_')) return 'Must end with a letter or number'
        return null
    }

    useEffect(() => {
        if (!reservationExpiry) {
            setTimeLeft(null)
            return
        }

        const interval = setInterval(() => {
            const now = new Date().getTime()
            const expiry = new Date(reservationExpiry).getTime()
            const diff = expiry - now

            if (diff <= 0) {
                setTimeLeft('0:00')
                setReservationExpiry(null)
                clearInterval(interval)
                if (['password', 'details', 'otp'].includes(step)) {
                    setError('Your handle reservation has expired. You can still continue creating your account, but your handle may change if someone else claims it.')
                }
            } else {
                const minutes = Math.floor(diff / 60000)
                const seconds = Math.floor((diff % 60000) / 1000)
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [reservationExpiry, step])

    const checkAvailability = useCallback(async (usernameToCheck: string, emailToUse?: string): Promise<boolean> => {
        setLoading(true)
        setError(null)
        let taken = false
        const normalizedEmail = (emailToUse || email).trim().toLowerCase()

        try {
            // Check players table
            const { data: player } = await supabase
                .from('players')
                .select('username')
                .eq('username', usernameToCheck)
                .maybeSingle()

            if (player) {
                setAvailability('taken')
                taken = true
            } else {
                // Check if reserved by someone else
                const { data: reservation } = await supabase
                    .from('handle_reservations')
                    .select('email, expires_at')
                    .eq('username', usernameToCheck)
                    .gt('expires_at', new Date().toISOString())
                    .maybeSingle()

                if (reservation && reservation.email !== normalizedEmail) {
                    setAvailability('taken')
                    taken = true
                } else {
                    setAvailability('available')
                }
            }
        } catch { }
        setLoading(false)
        return !taken
    }, [supabase, email])

    useEffect(() => {
        if (step !== 'username') return
        const val = username.trim()

        const timer = setTimeout(() => {
            if (!val) {
                setAvailability('idle')
                return
            }
            const valErr = validateUsername(val)
            if (valErr) {
                setAvailability('idle')
                setError(valErr)
                return
            }
            checkAvailability(val)
        }, 500)
        return () => clearTimeout(timer)
    }, [username, step, checkAvailability])

    const reserveHandle = useCallback(async (usernameToReserve: string, emailToUse: string) => {
        setLoading(true)
        setError(null)
        try {
            console.log(`Attempting to reserve @${usernameToReserve} for ${emailToUse}`)
            const res = await fetch('/api/auth/reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameToReserve, email: emailToUse }),
            })
            const data = await res.json()

            if (!res.ok) {
                console.error('Reservation failed:', data)
                setError(data.error || 'Failed to reserve handle')
                setAvailability('taken')
                return false
            }

            console.log('Reservation successful:', data)
            setReservationExpiry(data.expiresAt)
            setError(null)
            return true
        } catch (err) {
            console.error('Reservation error:', err)
            setError('Something went wrong. Please try again.')
            return false
        } finally {
            setLoading(false)
        }
    }, [])

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        const trimmedEmail = email.trim().toLowerCase()
        setEmail(trimmedEmail)

        if (!trimmedEmail) return setError('Email is required')
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return setError('Enter a valid email address')

        setLoading(true)
        try {
            // Check if email already exists
            const res = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail }),
            })
            const { exists } = await res.json()

            if (exists) {
                setError(
                    <span>
                        This email is already registered. <Link href="/login" className="text-white font-bold underline hover:no-underline">Log in &rarr;</Link>
                    </span>
                )
                setLoading(false)
                return
            }

            if (initialUsername && !validateUsername(initialUsername)) {
                // Check availability first
                const isAvailable = await checkAvailability(initialUsername, trimmedEmail)
                if (isAvailable) {
                    // Try to reserve it immediately
                    const reserved = await reserveHandle(initialUsername, trimmedEmail)
                    if (reserved) {
                        setStep('password')
                    } else {
                        setStep('username')
                    }
                } else {
                    setStep('username')
                    setError(`@${initialUsername} is no longer available.`)
                }
            } else {
                setStep('username')
            }
        } catch (err) {
            console.error('Email check failed:', err)
            setStep('username')
        } finally {
            setLoading(false)
        }
    }

    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        const valErr = validateUsername(username)
        if (valErr) {
            setError(valErr)
            return
        }

        const success = await reserveHandle(username, email)
        if (success) {
            setStep('password')
        }
    }

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (password.length < 6) return setError('Password must be at least 6 characters')
        setStep('details')
        setError(null)
    }

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!fullName.trim()) {
            return setError('Please enter your name to create your profile')
        }
        setStep('submitting')
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        full_name: fullName.trim(),
                        team: team.trim(),
                        league: league.trim(),
                    }
                }
            })
            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setError('This email is already registered. Please log in.')
                } else {
                    setError(signUpError.message)
                }
                setStep('details')
                return
            }
            setStep('otp')
            setError(null)
        } catch (err) {
            setError('Something went wrong creating your account.')
            setStep('details')
        }
    }

    const handleOtpDigitsChange = (index: number, value: string) => {
        const digit = value.slice(-1).replace(/\D/g, '')
        const newDigits = [...otpDigits]
        newDigits[index] = digit
        setOtpDigits(newDigits)

        // Move to next input if digit is entered
        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '')
        const newDigits = [...otpDigits]

        pastedData.split('').forEach((char, i) => {
            if (i < 6) newDigits[i] = char
        })

        setOtpDigits(newDigits)

        // Focus the last filled input or the next empty one
        const focusIndex = Math.min(pastedData.length, 5)
        otpRefs.current[focusIndex]?.focus()
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
                email: email.trim().toLowerCase(),
                token: otpCode,
                type: 'signup'
            })

            if (verifyError) {
                console.error('OTP Verification Error:', verifyError)
                setError(verifyError.message || 'Invalid verification code.')
                setLoading(false)
                return
            }
            setStep('success')
            router.push('/dashboard')
        } catch (err) {
            setError('Verification failed. Please try again.')
            setLoading(false)
        }
    }

    const handleResendOtp = async () => {
        setLoading(true)
        setError(null)
        try {
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            })
            if (resendError) throw resendError
            alert('A new code has been sent to your email.')
        } catch (err: any) {
            setError(err.message || 'Failed to resend code.')
        } finally {
            setLoading(false)
        }
    }

    if (step === 'submitting') {
        return (
            <div className="w-full flex flex-col items-center justify-center animate-fade-up px-4 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white/10 border-t-white animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Securing your spot</h2>
                <p className="text-hky-muted">Building your new identity...</p>
            </div>
        )
    }

    if (step === 'success') {
        return (
            <div className="w-full flex flex-col items-center justify-center animate-fade-up px-4 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Handle secured!</h2>
                <p className="text-hky-muted">Redirecting to your dashboard...</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                {step === 'email' && (
                    <>
                        {timeLeft && (
                            <div className="mb-2">
                                <span className="text-hky-muted text-sm capitalize">
                                    @{username} reserved for {timeLeft}
                                </span>
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
                            {initialUsername ? `Claim @${initialUsername} today` : 'Join hky.bio'}
                        </h1>
                        <p className="text-hky-muted text-sm pb-1">Sign up for free and secure your handle.</p>
                    </>
                )}

                {step === 'username' && (
                    <>
                        <button onClick={() => setStep('email')} className="text-ice-500 text-sm font-semibold mb-4 hover:text-white transition-colors flex items-center gap-1">
                            &larr; Back
                        </button>
                        {timeLeft && (
                            <div className="mb-2">
                                <span className="text-hky-muted text-sm capitalize">
                                    @{username} reserved for {timeLeft}
                                </span>
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">Choose your handle</h1>
                        <p className="text-hky-muted text-sm pb-1">Make it yours.</p>
                    </>
                )}

                {step === 'password' && (
                    <>
                        <button onClick={() => setStep(initialUsername ? 'email' : 'username')} className="text-ice-500 text-sm font-semibold mb-4 hover:text-white transition-colors flex items-center gap-1">
                            &larr; Back
                        </button>
                        {timeLeft && (
                            <div className="mb-2">
                                <span className="text-hky-muted text-sm capitalize">
                                    @{username} reserved for {timeLeft}
                                </span>
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">Create a password</h1>
                        <p className="text-hky-muted text-sm pb-1">Choose a secure password.</p>
                    </>
                )}

                {step === 'details' && (
                    <>
                        <button onClick={() => setStep('password')} className="text-ice-500 text-sm font-semibold mb-4 hover:text-white transition-colors flex items-center gap-1">
                            &larr; Back
                        </button>
                        {timeLeft && (
                            <div className="mb-2">
                                <span className="text-hky-muted text-sm capitalize">
                                    @{username} reserved for {timeLeft}
                                </span>
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">Tell us about yourself</h1>
                        <p className="text-hky-muted text-sm pb-1">This will be shown on your profile.</p>
                    </>
                )}

                {step === 'otp' && (
                    <>
                        {timeLeft && (
                            <div className="mb-2">
                                <span className="text-hky-muted text-sm capitalize">
                                    @{username} reserved for {timeLeft}
                                </span>
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">Check your email</h1>
                        <p className="text-hky-muted text-sm pb-1">We sent a 6-digit confirmation code to <strong className="text-white">{email}</strong>.</p>
                    </>
                )}

            </div>


            <div className="relative">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-fade-up">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-sm text-red-200">{error}</div>
                    </div>
                )}

                {step === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-5 animate-fade-up">
                        <input
                            ref={emailRef}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@email.com"
                            className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-5 py-3 sm:py-4 text-white text-base sm:text-lg font-medium placeholder:text-white/20 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all"
                        />
                        <button type="submit" disabled={loading} className="w-full bg-white text-hky-black hover:bg-ice-100 font-bold text-base sm:text-lg rounded-full py-3 sm:py-4 transition-colors">
                            Continue
                        </button>
                    </form>
                )}

                {step === 'username' && (
                    <form onSubmit={handleUsernameSubmit} className="space-y-4 animate-scale-in">
                        <div className={`flex items-center bg-[#1A1A24] border ${availability === 'taken' ? 'border-amber-500' : availability === 'available' ? 'border-green-500' : 'border-white/10'} rounded-xl px-4 py-3 transition-colors`}>
                            <span className="text-hky-muted font-bold text-lg whitespace-nowrap">hky.bio/</span>
                            <input
                                ref={usernameRef}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                placeholder="username"
                                className="w-full bg-transparent border-none px-2 text-white text-base sm:text-lg font-bold placeholder:text-white/20 focus:outline-none focus:ring-0"
                                maxLength={15}
                            />
                        </div>
                        <div className="h-6 px-1 flex items-center">
                            {loading ? (
                                <span className="text-sm text-hky-muted animate-pulse">Checking handle...</span>
                            ) : availability === 'taken' ? (
                                <span className="text-sm text-amber-500 font-medium">Handle is already taken</span>
                            ) : availability === 'available' ? (
                                <span className="text-sm text-green-500 font-medium">Handle is available!</span>
                            ) : null}
                        </div>
                        <button type="submit" disabled={availability === 'taken' || loading} className="w-full bg-white disabled:opacity-50 text-hky-black hover:bg-ice-100 font-bold text-base sm:text-lg rounded-full py-3 sm:py-4 transition-colors">
                            Continue
                        </button>
                    </form>
                )}

                {step === 'password' && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-5 animate-scale-in">
                        <input
                            ref={passwordRef}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-5 py-3 sm:py-4 text-white text-base sm:text-lg font-medium placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-all"
                        />
                        <button type="submit" disabled={password.length < 6} className="w-full bg-white disabled:opacity-50 text-hky-black hover:bg-ice-100 font-bold text-base sm:text-lg rounded-full py-3 sm:py-4 transition-colors">
                            Continue
                        </button>
                    </form>
                )}

                {step === 'details' && (
                    <form onSubmit={handleDetailsSubmit} className="space-y-4 animate-scale-in">
                        <div className="space-y-3">
                            <input
                                ref={detailsRef}
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Name"
                                className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-5 py-3 sm:py-4 text-white text-base sm:text-lg font-medium focus:outline-none focus:border-white/40 transition-all"
                            />
                            <input
                                type="text"
                                value={team}
                                onChange={(e) => setTeam(e.target.value)}
                                placeholder="Team"
                                className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-5 py-3 sm:py-4 text-white text-base sm:text-lg font-medium focus:outline-none focus:border-white/40 transition-all"
                            />
                            <input
                                type="text"
                                value={league}
                                onChange={(e) => setLeague(e.target.value)}
                                placeholder="League"
                                className="w-full bg-[#1A1A24] border border-white/10 rounded-xl px-5 py-3 sm:py-4 text-white text-base sm:text-lg font-medium focus:outline-none focus:border-white/40 transition-all"
                            />
                        </div>
                        <button type="submit" disabled={!fullName} className="w-full bg-white border border-white text-hky-black hover:bg-white/90 font-bold text-base sm:text-lg rounded-full py-3 sm:py-4 transition-colors">
                            Create Account
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={handleOtpSubmit} className="space-y-6 animate-scale-in">
                        <div className="flex justify-between gap-2 sm:gap-3">
                            {otpDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { otpRefs.current[i] = el }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpDigitsChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    onPaste={handleOtpPaste}
                                    className="w-full h-14 sm:h-16 bg-[#1A1A24] border border-white/10 rounded-xl text-center text-2xl font-bold focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all"
                                />
                            ))}
                        </div>
                        <button type="submit" disabled={otpCode.length < 6 || loading} className="w-full bg-white border border-white text-hky-black hover:bg-white/90 font-bold text-base sm:text-lg rounded-full py-3 sm:py-4 transition-colors">
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <div className="text-center mt-6">
                            <p className="text-sm text-hky-muted">
                                Didn't get an email? <button type="button" onClick={handleResendOtp} disabled={loading} className="text-white hover:underline transition-colors">Resend code</button> or <button type="button" onClick={() => setStep('email')} className="text-white hover:underline transition-colors">start over</button>.
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
