'use client'

import React from 'react'

interface PreviewPanelProps {
    isOpen: boolean
    onClose: () => void
    username: string
    children: React.ReactNode
}

export function PreviewPanel({ isOpen, onClose, username, children }: PreviewPanelProps) {
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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[80] flex flex-col bg-hky-black animate-slide-up">
            {/* Header - Same structure as AdminHeader */}
            <div className="sticky top-0 z-50 bg-hky-black/90 backdrop-blur-xl border-b border-white/[0.08] flex-shrink-0">
                <div className="h-[10%] min-h-[70px] max-w-3xl mx-auto flex items-center justify-between px-4">
                    {/* Back Arrow - Left */}
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 p-2 -ml-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
                        aria-label="Close preview"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
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

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto bg-hky-black">
                <div className="max-w-md mx-auto pb-8">
                    {children}
                </div>
            </div>
        </div>
    )
}
