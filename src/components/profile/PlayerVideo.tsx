'use client'

import React, { useState, useMemo } from 'react'
import { InlineEdit } from './InlineEdit'

export interface VideoEditData {
    url: string
    title: string
}

interface PlayerVideoProps {
    url: string
    title?: string
    isEditing?: boolean
    onChange?: (data: VideoEditData) => void
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

export function PlayerVideo({ url, title, isEditing = false, onChange }: PlayerVideoProps) {
    const [playing, setPlaying] = useState(false)
    const [thumbnailError, setThumbnailError] = useState(false)
    const videoId = useMemo(() => getYouTubeId(url), [url])
    const contextLabel = title || '';

    React.useEffect(() => {
        setThumbnailError(false)
    }, [videoId])

    if (!videoId && !isEditing) return null

    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/${thumbnailError ? 'hqdefault.jpg' : 'maxresdefault.jpg'}` : null

    return (

        <section
            className={`w-full py-4 lg:py-3 transition-all duration-500 ease-in-out ${!onChange ? 'animate-fade-up opacity-0' : ''}`}
            style={{
                ...(!onChange ? { animationDelay: '800ms', animationFillMode: 'forwards' } : undefined),
                paddingLeft: (playing || isEditing) ? '0px' : '16px',
                paddingRight: (playing || isEditing) ? '0px' : '16px',
            }}
        >

            {/* Section title (view mode only) */}
            {!isEditing && contextLabel && (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-3 text-center">{contextLabel}</p>
            )}

            {/* Edit mode fields */}
            {isEditing && (
                <div className="px-4 mb-3 w-full flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Section Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => onChange?.({ url: url, title: e.target.value })}
                            placeholder="Section Title (e.g. Highlights)"
                            className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50 placeholder:text-white/20"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Video URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={e => onChange?.({ url: e.target.value, title: title || '' })}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                            data-testid="video-url-input"
                        />
                    </div>
                </div>
            )}

            {/* Video player */}
            <div className={isEditing ? "px-4 w-full" : "w-full"}>
                <div
                    className={`relative w-full aspect-[16/9] bg-black overflow-hidden border transition-all duration-500 ease-in-out ${isEditing
                        ? 'border-white/[0.08] hover:border-white/[0.12] rounded-xl'
                        : 'border-white/[0.08] hover:border-white/[0.12]'
                        }`}
                    style={{
                        borderRadius: (playing && !isEditing) ? '0px' : (isEditing ? '12px' : '16px'),
                        borderColor: playing ? 'transparent' : undefined,
                    }}
                >
                    {playing && !isEditing ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1&playsinline=1`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full bg-black"
                        />
                    ) : thumbnailUrl ? (
                        <button
                            onClick={() => !isEditing && setPlaying(true)}
                            className="group absolute inset-0 w-full h-full cursor-pointer border-0 p-0 bg-transparent"
                            aria-label="Play video"
                        >
                            <img
                                src={thumbnailUrl}
                                alt="Video thumbnail"
                                onError={() => setThumbnailError(true)}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-70" />
                            {!isEditing && (
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
                            )}
                        </button>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04]">
                            <span className="text-white/20 text-sm">No valid video URL</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}