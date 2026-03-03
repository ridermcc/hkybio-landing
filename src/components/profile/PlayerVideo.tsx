'use client'

import React, { useState, useMemo } from 'react'

interface PlayerVideoProps {
    url: string
}

/** Extract the YouTube video ID from various URL formats */
function getYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    ]
    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}

export function PlayerVideo({ url }: PlayerVideoProps) {
    const [playing, setPlaying] = useState(false)
    const videoId = useMemo(() => getYouTubeId(url), [url])

    if (!videoId) return null

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    return (
        <section
            className="w-full py-4 animate-fade-up opacity-0 transition-all duration-500 ease-in-out"
            style={{
                animationDelay: '800ms',
                animationFillMode: 'forwards',
                paddingLeft: playing ? '0px' : '16px',
                paddingRight: playing ? '0px' : '16px',
            }}
        >
            {/* Section label — fades out when playing */}
            <div
                className="flex items-center justify-center mb-3 transition-all duration-500 ease-in-out overflow-hidden"
                style={{
                    maxHeight: playing ? '0px' : '20px',
                    opacity: playing ? 0 : 1,
                    marginBottom: playing ? '0px' : '12px',
                }}
            >
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.12]" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] px-4">
                    Highlights
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.12]" />
            </div>

            {/* Video player */}
            <div
                className="relative w-full aspect-[16/9] bg-black overflow-hidden border border-white/[0.08] hover:border-white/[0.12] transition-all duration-500 ease-in-out"
                style={{
                    borderRadius: playing ? '0px' : '16px',
                    borderColor: playing ? 'transparent' : undefined,
                }}
            >
                {playing ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1&playsinline=1`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full bg-black"
                    />
                ) : (
                    <button
                        onClick={() => setPlaying(true)}
                        className="group absolute inset-0 w-full h-full cursor-pointer border-0 p-0 bg-transparent"
                        aria-label="Play video"
                    >
                        <img
                            src={thumbnailUrl}
                            alt="Video thumbnail"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.15] flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:border-white/[0.3] group-hover:bg-black/60 group-active:scale-95">
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6 text-white/90"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    </button>
                )}
            </div>
        </section>
    )
}