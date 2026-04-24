'use client'

import React from 'react'

interface AdminHeaderProps {
    username: string
    avatarUrl?: string
    onUserClick?: () => void
}

export function AdminHeader({ username, avatarUrl, onUserClick }: AdminHeaderProps) {
    const handleShare = async () => {
        const url = `https://hky.bio/${username}`
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${username}'s Profile`,
                    url: url,
                })
            } catch (err) {
                // User cancelled or share failed
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(url)
                // Could show toast here
            } catch (err) {
                console.error('Failed to copy:', err)
            }
        }
    }

    return (
        <div className="sticky top-0 z-50 bg-hky-black/90 backdrop-blur-xl border-b border-white/[0.08]">
            <div className="h-[10%] min-h-[70px] max-w-3xl mx-auto flex items-center justify-between px-4">
                {/* User Icon - Left */}
                <button
                    onClick={onUserClick}
                    className="flex items-center gap-2 p-2 -ml-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
                    aria-label="User menu"
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover border border-white/[0.1]"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                    )}
                </button>

                {/* hky.bio/username - Center */}
                <div className="flex-1 text-center px-4">
                    <p className="text-sm font-semibold text-white/90 truncate">
                        hky.bio/{username}
                    </p>
                </div>

                {/* Share Button - Right */}
                <button
                    onClick={handleShare}
                    className="p-2 -mr-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
                    aria-label="Share profile"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
