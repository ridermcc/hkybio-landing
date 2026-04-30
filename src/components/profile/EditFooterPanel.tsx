'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FooterMode, FooterEditData } from './ProfileFooter'

interface EditFooterPanelProps {
    isOpen: boolean
    onClose: () => void
    data: FooterEditData
    onSave: (partial: Partial<FooterEditData>) => void
}

export function EditFooterPanel({ isOpen, onClose, data, onSave }: EditFooterPanelProps) {
    const [mounted, setMounted] = useState(false)
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

    useEffect(() => {
        if (isOpen) setYOffset(0)
    }, [isOpen])

    if (!isOpen || !mounted) return null

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
                        <div className="flex flex-1" />
                        <h2 className="text-lg font-bold text-white text-center whitespace-nowrap select-none pointer-events-none">
                            Edit profile footer
                        </h2>
                        <div className="flex flex-1 justify-end">
                            <button
                                onClick={onClose}
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
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Mode Toggle */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block px-1">
                            Footer Type
                        </label>
                        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl w-full">
                            <button
                                onClick={() => onSave({ mode: 'player' })}
                                className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${data.mode === 'player'
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-white/40 hover:text-white/70'
                                    }`}
                                type="button"
                            >
                                Player Info
                            </button>
                            <button
                                onClick={() => onSave({ mode: 'represented' })}
                                className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${data.mode === 'represented'
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-white/40 hover:text-white/70'
                                    }`}
                                type="button"
                            >
                                Represented By
                            </button>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {data.mode === 'player' ? (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block px-1">
                                        Player Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.playerName}
                                        onChange={e => onSave({ playerName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                                        placeholder="Player Name (Optional)"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block px-1">
                                        Current Team
                                    </label>
                                    <input
                                        type="text"
                                        value={data.teamName}
                                        onChange={e => onSave({ teamName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                                        placeholder="Team (Optional)"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block px-1">
                                        League
                                    </label>
                                    <input
                                        type="text"
                                        value={data.leagueName}
                                        onChange={e => onSave({ leagueName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                                        placeholder="League (Optional)"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block px-1">
                                        Agent Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.agentName}
                                        onChange={e => onSave({ agentName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                                        placeholder="Agent Name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block px-1">
                                        Agency Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.agencyName}
                                        onChange={e => onSave({ agencyName: e.target.value })}
                                        className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                                        placeholder="Agency Name"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white hover:bg-white/90 text-black rounded-xl font-bold text-[14px] transition-all shadow-lg shadow-white/5 active:scale-[0.98]"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
