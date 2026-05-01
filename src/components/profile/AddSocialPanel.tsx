'use client'

import React, { useState, useEffect, useRef } from 'react'
import { SOCIAL_PLATFORMS, SocialPlatformMeta, getPlatformIcon } from '@/lib/constants'

import { createPortal } from 'react-dom'

interface AddSocialPanelProps {
    isOpen: boolean
    onClose: () => void
    existingLinks: { platform: string; url: string }[]
    initialPlatform?: string | null
    onSave: (platform: string, url: string) => void
    onRemove: (platform: string) => void
}

export function AddSocialPanel({ isOpen, onClose, existingLinks, initialPlatform, onSave, onRemove }: AddSocialPanelProps) {
    const [mounted, setMounted] = useState(false)
    const [view, setView] = useState<'list' | 'config'>('list')
    const [selectedMeta, setSelectedMeta] = useState<SocialPlatformMeta | null>(null)
    const [inputValue, setInputValue] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    const [yOffset, setYOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const dragStartY = useRef(0)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen) {
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
        if ((e.target as Element).closest('button') || (e.target as Element).closest('input')) return
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

    // Reset offset when opening
    useEffect(() => {
        if (isOpen) setYOffset(0)
    }, [isOpen])

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('')
            if (initialPlatform) {
                const searchPlatform = initialPlatform.toLowerCase();
                const meta = SOCIAL_PLATFORMS.find(p => p.id.toLowerCase() === searchPlatform)
                if (meta) {
                    setSelectedMeta(meta)
                    setView('config')
                    // Find existing url to pre-fill
                    const existing = existingLinks.find(l => l.platform.toLowerCase() === searchPlatform)
                    if (existing) {
                        setInputValue(meta.fromUrl ? meta.fromUrl(existing.url) : existing.url)
                    } else {
                        setInputValue('')
                    }
                } else {
                    setView('list')
                }
            } else {
                setView('list')
                setSelectedMeta(null)
                setInputValue('')
            }
        }
    }, [isOpen, initialPlatform, existingLinks])

    if (!isOpen || !mounted) return null

    const availablePlatforms = SOCIAL_PLATFORMS.filter(p => {
        // Only hide if we are in list view and it's already added. 
        // We allow editing if it's already added by clicking on it from hero (which skips list view).
        if (view === 'list') {
            return !existingLinks.some(l => l.platform.toLowerCase() === p.id.toLowerCase()) && p.label.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return true
    })

    const handleSelectPlatform = (meta: SocialPlatformMeta) => {
        setSelectedMeta(meta)
        setView('config')
        setInputValue('')
    }

    const handleSave = () => {
        if (!selectedMeta || !inputValue.trim()) return
        const formattedUrl = selectedMeta.toUrl ? selectedMeta.toUrl(inputValue.trim()) : inputValue.trim()
        onSave(selectedMeta.id, formattedUrl)
        onClose()
    }

    const handleRemove = () => {
        if (!selectedMeta) return
        onRemove(selectedMeta.id)
        onClose()
    }

    const isValid = inputValue.trim().length > 0
    const isExisting = selectedMeta ? existingLinks.some(l => l.platform.toLowerCase() === selectedMeta.id.toLowerCase()) : false

    return createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer overscroll-none touch-none"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`relative bg-hky-black border-t border-white/[0.1] rounded-t-3xl h-[80vh] flex flex-col ${!isDragging ? 'transition-transform duration-200 ease-out animate-slide-up' : ''}`}
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
                        <div className="flex flex-1 items-center gap-2">
                            {view === 'config' && !initialPlatform && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setView('list'); }}
                                    className="p-1 -ml-1 text-white/50 hover:text-white transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                            )}
                            {view === 'config' && selectedMeta && (
                                <div className="w-6 h-6 bg-white/[0.06] rounded-md flex items-center justify-center shrink-0">
                                    {selectedMeta.iconPath ? (
                                        <img src={selectedMeta.iconPath} alt={selectedMeta.label} className="w-4 h-4 object-contain" />
                                    ) : (
                                        <span className="text-[10px]">🔗</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <h2 className="text-lg font-bold text-white text-center whitespace-nowrap select-none pointer-events-none">
                            {view === 'config' && selectedMeta ? `${selectedMeta.label}` : 'Add social icon'}
                        </h2>
                        <div className="flex flex-1 justify-end">
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="p-1 text-white/50 hover:text-white/80 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {view === 'list' && (
                        <div className="space-y-4">
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search platform"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-[14px] text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                                />
                            </div>

                            <div className="flex flex-col">
                                {availablePlatforms.map(meta => (
                                    <button
                                        key={meta.id}
                                        onClick={() => handleSelectPlatform(meta)}
                                        className="flex items-center justify-between py-3.5 hover:bg-white/[0.03] transition-colors rounded-xl px-2 -mx-2 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center">
                                                {meta.iconPath ? (
                                                    <img src={meta.iconPath} alt={meta.label} className="w-5 h-5 object-contain" />
                                                ) : (
                                                    <span className="text-white/40">🔗</span>
                                                )}
                                            </div>
                                            <span className="text-[15px] font-medium text-white">{meta.label}</span>
                                        </div>
                                        <svg className="text-white/20 group-hover:text-white/40 transition-colors" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                ))}
                                {availablePlatforms.length === 0 && (
                                    <div className="text-center py-10 text-white/40 text-[15px]">
                                        No platforms found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {view === 'config' && selectedMeta && (
                        <div className="space-y-6 pt-2">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                                    {selectedMeta.inputPrompt}
                                </label>
                                <input
                                    type={selectedMeta.inputType}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder={selectedMeta.inputPlaceholder}
                                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-ice-500/50 transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3">
                                {isExisting && (
                                    <button
                                        onClick={handleRemove}
                                        className="flex-1 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-white/70 hover:text-white rounded-lg font-semibold text-[13px] transition-colors"
                                    >
                                        Remove
                                    </button>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={!isValid}
                                    className="flex-[2] py-3 bg-white hover:bg-white/90 disabled:bg-white/[0.04] disabled:text-white/20 text-black rounded-xl font-bold text-[14px] transition-all active:scale-[0.98] shadow-lg shadow-white/5"
                                >
                                    {isExisting ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
