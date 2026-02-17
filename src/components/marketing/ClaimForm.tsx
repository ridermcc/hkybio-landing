'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/legacy-client';

type Step = 'email' | 'username' | 'info' | 'submitting' | 'success';

const USERNAME_REGEX = /^[a-z0-9._]+$/;
const MIN_LEN = 3;
const MAX_LEN = 15;

interface FormData {
    email: string;
    username: string;
    full_name: string;
    team: string;
    league: string;
}

function validateUsername(v: string): string | null {
    if (!v) return 'Enter a username';
    if (v.length < MIN_LEN) return `At least ${MIN_LEN} characters`;
    if (v.length > MAX_LEN) return `Max ${MAX_LEN} characters`;
    if (!USERNAME_REGEX.test(v)) return 'Only lowercase letters, numbers, dots & underscores';
    if (v.startsWith('.') || v.startsWith('_')) return 'Must start with a letter or number';
    if (v.endsWith('.') || v.endsWith('_')) return 'Must end with a letter or number';
    return null;
}

/** Generate alternative username suggestions from the original */
function generateSuggestions(original: string): string[] {
    const base = original.replace(/[0-9]+$/, ''); // strip trailing numbers
    const suggestions: string[] = [];
    const year = new Date().getFullYear().toString().slice(-2);

    // number suffixes
    suggestions.push(`${original}1`);
    suggestions.push(`${original}${year}`);
    suggestions.push(`${base}_hky`);
    suggestions.push(`${original}.x`);
    suggestions.push(`${base}${Math.floor(Math.random() * 90) + 10}`);

    // de-dup & filter valid
    return [...new Set(suggestions)]
        .filter((s) => s.length >= MIN_LEN && s.length <= MAX_LEN && USERNAME_REGEX.test(s))
        .slice(0, 4);
}

export default function ClaimForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialUsername = searchParams.get('username') || '';

    const [step, setStep] = useState<Step>('email');
    const [formData, setFormData] = useState<FormData>({
        email: '',
        username: initialUsername,
        full_name: '',
        team: '',
        league: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [availability, setAvailability] = useState<'idle' | 'available' | 'taken'>('idle');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [availableSuggestions, setAvailableSuggestions] = useState<string[]>([]);
    const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});
    const [copied, setCopied] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    // Redirect if no username
    useEffect(() => {
        if (!initialUsername) {
            router.replace('/');
        }
    }, [initialUsername, router]);

    // Auto-focus based on step
    useEffect(() => {
        if (step === 'email') emailRef.current?.focus();
        if (step === 'username') usernameRef.current?.focus();
        if (step === 'info') nameRef.current?.focus();
    }, [step]);

    // ── Check username availability ──
    const checkAvailability = useCallback(async (usernameToCheck: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        let taken = false;

        try {
            const { data, error: dbErr } = await supabase
                .from('waitlist')
                .select('username')
                .eq('username', usernameToCheck)
                .maybeSingle();

            if (dbErr) {
                console.error('DB error:', dbErr);
            }

            if (data) {
                setAvailability('taken');
                taken = true;
            } else {
                setAvailability('available');
            }
        } catch {
            // non-blocking
        }

        setIsLoading(false);
        return !taken;
    }, []);

    // ── Email submission — capture email immediately ──
    async function handleEmailSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const email = formData.email.trim();
        if (!email) {
            setError('Email is required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Enter a valid email address');
            return;
        }

        setIsLoading(true);

        // Check if email is already on waitlist
        try {
            const { data: emailData, error: emailErr } = await supabase
                .from('waitlist')
                .select('email')
                .eq('email', email)
                .maybeSingle();

            if (emailErr) console.error('Email check error:', emailErr);

            if (emailData) {
                setError('This email is already on the waitlist!');
                setIsLoading(false);
                return;
            }
        } catch {
            // non-blocking
        }

        // ── Insert email immediately so it's captured even if user abandons ──
        try {
            const res = await fetch('/api/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', email }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    setError(data.error || 'This email is already on the waitlist!');
                } else {
                    console.error('Early insert error:', data.error);
                    setError('Something went wrong. Please try again.');
                }
                setIsLoading(false);
                return;
            }
        } catch {
            console.error('Early insert failed');
        }

        setIsLoading(false);

        // Move to username step
        setStep('username');

        // Check validity and availability immediately
        const valErr = validateUsername(formData.username);
        if (valErr) {
            setError(valErr);
        } else {
            await checkAvailability(formData.username);
        }
    }

    // ── Username step: continue ──
    async function handleUsernameSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const valErr = validateUsername(formData.username);
        if (valErr) {
            setError(valErr);
            return;
        }

        // Check availability before proceeding
        const isAvailable = await checkAvailability(formData.username);
        if (!isAvailable) {
            return;
        }

        setStep('info');
    }

    // ── Debounced check ──
    useEffect(() => {
        // Only run this check if we are on the username step
        if (step !== 'username') return;

        const val = formData.username.trim();

        // Clear availability while typing/debouncing
        // We don't want to clear error immediately here because onChange already clears it.
        // If we cleared it here, it would flicker.
        // We just want to wait.

        const timer = setTimeout(() => {
            if (!val) {
                setAvailability('idle');
                return;
            }

            const valErr = validateUsername(val);
            if (valErr) {
                setAvailability('idle');
                setError(valErr);
                return;
            }

            // If valid, check availability
            checkAvailability(val);
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.username, step, checkAvailability]);

    // ── Final submit — update the existing row with all details ──
    async function handleInfoSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setInfoErrors({});

        // Validate required fields
        const errors: Record<string, string> = {};
        if (!formData.full_name.trim()) errors.full_name = 'Name is required';
        if (!formData.team.trim()) errors.team = 'Team is required';
        if (!formData.league.trim()) errors.league = 'League is required';

        if (Object.keys(errors).length > 0) {
            setInfoErrors(errors);
            return;
        }

        setStep('submitting');

        try {
            const res = await fetch('/api/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update',
                    email: formData.email.trim(),
                    username: formData.username,
                    full_name: formData.full_name.trim(),
                    team: formData.team.trim(),
                    league: formData.league.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    setError(data.error || `hky.bio/${formData.username} is unavailable.`);
                } else {
                    console.error('Update error:', data.error);
                    setError('Something went wrong. Please try again.');
                }
                setStep('info');
                return;
            }

            setStep('success');
        } catch {
            setError('Something went wrong. Please try again.');
            setStep('info');
        }
    }

    if (!initialUsername) return null;

    // ════════════════════════════════════════════
    //  SUCCESS
    // ════════════════════════════════════════════
    if (step === 'success') {
        return (
            <div className="w-full max-w-lg mx-auto animate-fade-up">
                <div className="glass-card p-8 sm:p-10 text-center relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center gap-6">

                        {/* Header Group */}
                        <div className="flex flex-col items-center gap-2">
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Handle secured
                            </h1>
                            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-ice-900/30 border border-ice-800/30">
                                <p className="text-lg text-ice-200 font-mono tracking-wide">
                                    hky.bio/{formData.username}
                                </p>
                            </div>
                        </div>

                        {/* Confirmation Text */}
                        <p className="text-hky-muted text-sm leading-relaxed max-w-xs mx-auto">
                            Confirmation sent to <span className="text-white font-medium">{formData.email}</span>.
                        </p>

                        {/* CTA Group */}
                        <div className="w-full flex flex-col items-center gap-3 mt-2">
                            <p className="text-white text-sm font-medium">
                                Don&apos;t let the boys get chirped with a bad handle.
                            </p>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText('https://hky.bio');
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="group relative w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-ice-500/30 rounded-xl px-5 py-3 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer`}></div>

                                <span className="text-hky-muted group-hover:text-white transition-colors font-mono text-base relative z-10">https://hky.bio</span>

                                <div className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors relative z-10 ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-hky-muted group-hover:bg-ice-500/20 group-hover:text-white'}`}>
                                    {copied ? (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════
    //  SUBMITTING
    // ════════════════════════════════════════════
    if (step === 'submitting') {
        return (
            <div className="w-full max-w-lg mx-auto text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-ice-700/30 border-t-ice-700 animate-spin"></div>
                <p className="text-xl text-hky-muted">Reserving hky.bio/{formData.username}...</p>
            </div>
        );
    }

    // ════════════════════════════════════════════
    //  STEP 1 — EMAIL
    // ════════════════════════════════════════════
    if (step === 'email') {
        return (
            <div className="w-full max-w-lg mx-auto animate-fade-up">
                <div className="text-center mb-5 sm:mb-8">
                    <h1 className="text-xl sm:text-3xl font-bold mb-2">
                        Claim hky.bio/{initialUsername}
                    </h1>

                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                        <input
                            ref={emailRef}
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="Email"
                            className="input-field text-lg"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-center text-sm text-red-400 animate-fade-up">{error}</p>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full btn-primary text-lg py-4">
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            </span>
                        ) : (
                            'Continue'
                        )}
                    </button>

                    <p className="text-xs text-hky-dim text-center leading-relaxed mt-3">
                        By clicking continue, you agree to hky.bio&apos;s{' '}
                        <a href="/privacy" target="_blank" className="underline hover:text-white transition-colors">privacy notice</a>,{' '}
                        <a href="/terms" target="_blank" className="underline hover:text-white transition-colors">T&amp;Cs</a>{' '}
                        and to receive offers, news and updates.
                    </p>
                </form>


            </div>
        );
    }

    // ════════════════════════════════════════════
    //  STEP 2 — CHOOSE YOUR USERNAME
    // ════════════════════════════════════════════
    if (step === 'username') {
        return (
            <div className="w-full max-w-lg mx-auto animate-fade-up">
                <div className="text-center mb-5 sm:mb-8">
                    <h2 className="text-xl sm:text-3xl font-bold mb-2">Choose Your Handle</h2>
                </div>

                <form onSubmit={handleUsernameSubmit} className="space-y-4">
                    <div className="claim-input-group">
                        <span className="claim-prefix">hky.bio/</span>
                        <input
                            ref={usernameRef}
                            type="text"
                            value={formData.username}
                            onChange={(e) => {
                                const raw = e.target.value.toLowerCase().replace(/\s/g, '');
                                setFormData((prev) => ({ ...prev, username: raw }));
                                setError(null);
                                setAvailability('idle');
                            }}
                            placeholder="yourname"
                            className="claim-input"
                            maxLength={MAX_LEN}
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </div>

                    {/* Availability / Error Message */}
                    <div className="text-left text-sm min-h-[20px]">
                        {isLoading ? (
                            <span className="text-hky-muted animate-pulse">Checking...</span>
                        ) : (
                            <>
                                {availability === 'taken' && (
                                    <span className="text-amber-400 font-medium">
                                        Handle is taken
                                    </span>
                                )}
                                {availability === 'available' && (
                                    <span className="text-green-400 font-medium">
                                        Handle is available
                                    </span>
                                )}
                                {error && availability === 'idle' && (
                                    <span className="text-red-400">{error}</span>
                                )}
                            </>
                        )}
                    </div>

                    <button type="submit" disabled={availability === 'taken' || isLoading} className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed">
                        Continue
                    </button>
                </form>
            </div>
        );
    }

    // ════════════════════════════════════════════
    //  STEP 3 — INFO (required fields)
    // ════════════════════════════════════════════
    return (
        <div className="w-full max-w-lg mx-auto animate-fade-up">
            <div className="text-center mb-5 sm:mb-8">
                <h2 className="text-xl sm:text-3xl font-bold mb-2">
                    Secure <span className="text-white">hky.bio/{formData.username}</span>
                </h2>
                <p className="text-sm sm:text-base text-hky-muted">
                    Fill in your details
                </p>
            </div>

            <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div>
                    <input
                        ref={nameRef}
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => { setFormData((prev) => ({ ...prev, full_name: e.target.value })); setInfoErrors((prev) => ({ ...prev, full_name: '' })); }}
                        placeholder="Full name"
                        className={`input-field ${infoErrors.full_name ? 'border-red-400' : ''}`}
                        autoFocus
                    />
                    {infoErrors.full_name && <p className="text-xs text-red-400 mt-1 ml-1">{infoErrors.full_name}</p>}
                </div>

                <div>
                    <input
                        type="text"
                        value={formData.team}
                        onChange={(e) => { setFormData((prev) => ({ ...prev, team: e.target.value })); setInfoErrors((prev) => ({ ...prev, team: '' })); }}
                        placeholder="Team"
                        className={`input-field ${infoErrors.team ? 'border-red-400' : ''}`}
                    />
                    {infoErrors.team && <p className="text-xs text-red-400 mt-1 ml-1">{infoErrors.team}</p>}
                </div>
                <div>
                    <input
                        type="text"
                        value={formData.league}
                        onChange={(e) => { setFormData((prev) => ({ ...prev, league: e.target.value })); setInfoErrors((prev) => ({ ...prev, league: '' })); }}
                        placeholder="League"
                        className={`input-field ${infoErrors.league ? 'border-red-400' : ''}`}
                    />
                    {infoErrors.league && <p className="text-xs text-red-400 mt-1 ml-1">{infoErrors.league}</p>}
                </div>

                {error && (
                    <p className="text-center text-sm text-red-400 animate-fade-up">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={!formData.full_name || !formData.team || !formData.league}
                    className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Join the Waitlist
                </button>
            </form>

            <button
                onClick={() => { setStep('username'); setError(null); setInfoErrors({}); }}
                className="block mx-auto mt-4 text-sm text-hky-dim hover:text-hky-muted transition-colors"
            >
                ← Change username
            </button>
        </div>
    );
}
