'use client'

import React from 'react'

interface FloatingActionBarProps {
    onAddClick: () => void
    onPreviewClick: () => void
}

export function FloatingActionBar({ onAddClick, onPreviewClick }: FloatingActionBarProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 bg-hky-black/95 backdrop-blur-xl border border-white/[0.1] rounded-full px-2 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                {/* Add Button */}
                <button
                    onClick={onAddClick}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-white/90 text-black rounded-full transition-all duration-200 font-bold text-sm shadow-lg shadow-white/5 active:scale-[0.98]"
                    aria-label="Add section"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span>Add</span>
                </button>

                {/* Preview Button */}
                <button
                    onClick={onPreviewClick}
                    className="flex items-center gap-2 px-5 py-2.5 bg-transparent hover:bg-white/5 text-white border border-white/20 rounded-full transition-all duration-200 font-bold text-sm active:scale-[0.98]"
                    aria-label="Preview profile"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Preview</span>
                </button>
            </div>
        </div>
    )
}
