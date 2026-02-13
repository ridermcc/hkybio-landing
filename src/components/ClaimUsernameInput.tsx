'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const USERNAME_REGEX = /^[a-z0-9._]+$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 20;

function validateUsername(value: string): string | null {
    if (!value) return null; // No error when empty
    if (value.length > MAX_LENGTH) return `Max ${MAX_LENGTH} characters`;
    if (!USERNAME_REGEX.test(value)) return 'Only lowercase letters, numbers, dots & underscores';
    if (value.startsWith('.') || value.startsWith('_')) return 'Must start with a letter or number';
    if (value.endsWith('.') || value.endsWith('_')) return 'Must end with a letter or number';
    return null;
}

export default function ClaimUsernameInput() {
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.toLowerCase().replace(/\s/g, '');
        setUsername(raw);
        setError(null);
    }, []);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!username.trim()) {
            setError('Enter a username');
            return;
        }

        const validationError = validateUsername(username);
        if (validationError) {
            setError(validationError);
            return;
        }

        router.push(`/claim?username=${encodeURIComponent(username)}`);
    }



    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
            <div
                className={`claim-input-group ${isFocused ? 'focused' : ''} ${error ? 'has-error' : ''}`}
            >
                <span className="claim-prefix">hky.bio/</span>
                <input
                    type="text"
                    value={username}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="yourname"
                    className="claim-input"
                    maxLength={MAX_LENGTH}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    autoFocus
                />
            </div>

            {/* Validation hint */}
            {error && (
                <p className="text-center text-sm text-red-400 mt-3 animate-fade-up">
                    {error}
                </p>
            )}


            <button
                type="submit"
                className="w-full btn-primary text-lg py-4 mt-5"
            >
                Claim Your Name
            </button>
        </form>
    );
}
