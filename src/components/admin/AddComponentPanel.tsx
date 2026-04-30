'use client'

import React, { useState, useEffect, useRef } from 'react'
import { SectionType } from '@/app/(app)/dashboard/ProfileEditorClient'
import { createPortal } from 'react-dom'

// sections that can only appear once
const UNIQUE_SECTIONS: SectionType[] = ['stats', 'schedule', 'video', 'journey', 'articles']

export const SECTION_META: Record<SectionType, { label: string; description: string; icon: React.ReactNode }> = {
    link: {
        label: 'Link',
        description: 'Add a URL.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
        ),
    },
    stats: {
        label: 'Stats',
        description: 'Season stats & bio info.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
    },
    schedule: {
        label: 'Schedule',
        description: 'Upcoming games.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    video: {
        label: 'Video',
        description: 'Add any video.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
        ),
    },
    journey: {
        label: 'Career',
        description: 'Teams & accolades.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
        ),
    },
    articles: {
        label: 'News',
        description: 'Press coverage.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8" />
                <path d="M15 18h-5" />
                <path d="M10 6h8v4h-8V6z" />
            </svg>
        ),
    },
}

// Form data interfaces
export interface LinkItemFormData {
    name: string
    imageUrl: string
    linkUrl: string
    description: string
}

export interface StatsFormData {
    season?: string
    position: string
    shootsCatches: string
    height: string
    weight: string
    birthYear: string
}

export interface VideoFormData {
    url: string
    title: string
}

export interface ArticlesFormData {
    url: string
}

export interface ScheduleFormData {
    scheduleUrl: string
}

export type ComponentFormData =
    | LinkItemFormData
    | StatsFormData
    | VideoFormData
    | ArticlesFormData
    | ScheduleFormData

interface AddComponentPanelProps {
    isOpen: boolean
    onClose: () => void
    activeSections: string[]
    onAdd: (type: SectionType, initialData?: ComponentFormData) => void
}

export function AddComponentPanel({ isOpen, onClose, activeSections, onAdd }: AddComponentPanelProps) {
    const [yOffset, setYOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const dragStartY = useRef(0)

    // Reset state when panel opens
    useEffect(() => {
        if (isOpen) {
            setYOffset(0)

            const currentScrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${currentScrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            document.body.dataset.scrollY = currentScrollY.toString();
        }

        return () => {
            if (document.body.style.position === 'fixed') {
                const storedScrollY = document.body.dataset.scrollY;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                if (storedScrollY) {
                    window.scrollTo({ top: parseInt(storedScrollY), behavior: 'instant' });
                }
            }
        };
    }, [isOpen])

    const handleDragStart = (e: React.TouchEvent | React.MouseEvent, clientY: number) => {
        if ((e.target as Element).closest('button') || (e.target as Element).closest('input') || (e.target as Element).closest('select') || (e.target as Element).closest('textarea')) return
        dragStartY.current = clientY
        setIsDragging(true)
    }

    const handleDragMove = (clientY: number) => {
        if (!isDragging) return
        const delta = clientY - dragStartY.current
        if (delta > 0) {
            setYOffset(delta)
        }
    }

    const handleDragEnd = () => {
        if (!isDragging) return
        setIsDragging(false)
        if (yOffset > 100) {
            onClose()
        } else {
            setYOffset(0)
        }
    }


    if (!isOpen || typeof document === 'undefined') return null

    const availableSections = (Object.keys(SECTION_META) as SectionType[]).filter(type => {
        if (!UNIQUE_SECTIONS.includes(type)) return true
        return !activeSections.includes(type)
    })

    const handleTypeSelect = (type: SectionType) => {
        onAdd(type)
        onClose()
    }

    return createPortal(
        <div className="fixed inset-0 z-[70] flex flex-col justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity overscroll-none touch-none"
                onClick={onClose}
            />

            {/* Panel - 80% height from bottom */}
            <div
                className={`relative bg-hky-black border-t border-white/[0.1] rounded-t-3xl h-[60vh] flex flex-col ${!isDragging ? 'transition-transform duration-200 ease-out animate-slide-up' : ''}`}
                style={{ transform: `translateY(${yOffset}px)` }}
            >
                {/* Draggable Header Area */}
                <div
                    className="shrink-0 cursor-grab active:cursor-grabbing touch-none flex flex-col w-full"
                    onTouchStart={e => handleDragStart(e, e.touches[0].clientY)}
                    onTouchMove={e => handleDragMove(e.touches[0].clientY)}
                    onTouchEnd={handleDragEnd}
                    onMouseDown={e => handleDragStart(e, e.clientY)}
                    onMouseMove={e => handleDragMove(e.clientY)}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                >
                    {/* Handle bar */}
                    <div className="flex justify-center pt-3 pb-2 w-full">
                        <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pb-4 border-b border-white/[0.06] w-full">
                        <div className="flex-1" />
                        <h2 className="text-lg font-bold text-white whitespace-nowrap select-none pointer-events-none">
                            Add Component
                        </h2>
                        <div className="flex flex-1 justify-end">
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="p-2 text-white/50 hover:text-white/80 transition-colors rounded-full hover:bg-white/[0.06]"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Component Type Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {availableSections.map((type) => {
                            const meta = SECTION_META[type]
                            return (
                                <button
                                    key={type}
                                    onClick={() => handleTypeSelect(type)}
                                    className="flex flex-col items-center gap-3 p-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 rounded-2xl transition-all duration-200 group"
                                >
                                    <div className="text-white/50 group-hover:text-ice-400 transition-colors">
                                        {meta.icon}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-white/90">{meta.label}</p>
                                        <p className="text-xs text-white/40 mt-0.5">{meta.description}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
