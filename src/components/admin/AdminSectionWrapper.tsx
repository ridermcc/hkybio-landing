'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface AdminSectionWrapperProps {
    id: string
    label: string
    isHero?: boolean
    defaultExpanded?: boolean
    isVisible?: boolean
    onToggleVisibility?: () => void
    onRemove: () => void
    children: React.ReactNode
}

export function AdminSectionWrapper({
    id,
    label,
    isHero = false,
    defaultExpanded = false,
    isVisible = true,
    onToggleVisibility,
    onRemove,
    children,
}: AdminSectionWrapperProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        if (showDeleteConfirm) {
            const currentScrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${currentScrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            document.body.dataset.scrollY = currentScrollY.toString();
        }

        return () => {
            // Check if we need to restore scroll (if it was fixed by this component instance)
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
    }, [showDeleteConfirm])

    // Auto-expand newly added sections (we can just default to false for simplicity, as they can tap it)
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: isHero })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isHero) return
        setShowDeleteConfirm(true)
    }

    const handleConfirmDelete = () => {
        onRemove()
        setShowDeleteConfirm(false)
    }

    const toggleExpand = () => {
        if (isHero) return
        setIsExpanded(!isExpanded)
    }

    return (
        <div ref={setNodeRef} style={style} className={`group/section relative w-full mb-3 px-3 lg:mb-4 z-10 ${isDragging ? 'z-50' : ''}`}>
            <div className={`relative w-full overflow-hidden transition-all duration-300 z-10 ${isHero ? '' : `rounded-2xl bg-hky-black ring-1 ring-inset ${isExpanded ? 'ring-white/50 shadow-[0_0_30px_rgba(255,255,255,0.04)]' : 'ring-white/[0.08] hover:ring-white/[0.15]'}`}`}>

                {/* Controls bar - inside container, left drag, right delete */}
                {!isHero && (
                    <div
                        className={`flex items-center justify-between px-3 py-3 cursor-pointer select-none transition-colors ${isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.02]'}`}
                        onClick={toggleExpand}
                    >
                        {/* Left: Drag handle and Label */}
                        <div className="flex items-center gap-3">
                            <button
                                {...attributes}
                                {...listeners}
                                className="p-2 -ml-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
                                aria-label="Drag to reorder"
                                data-testid={`drag-handle-${id}`}
                                onClick={(e) => e.stopPropagation()} // Prevent expand when grabbing
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="9" cy="5" r="2" />
                                    <circle cx="15" cy="5" r="2" />
                                    <circle cx="9" cy="12" r="2" />
                                    <circle cx="15" cy="12" r="2" />
                                    <circle cx="9" cy="19" r="2" />
                                    <circle cx="15" cy="19" r="2" />
                                </svg>
                            </button>

                            <span className={`text-[14px] font-bold transition-opacity ${isVisible ? 'text-white/90' : 'text-white/30'}`}>
                                {label}
                                {!isVisible && <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-white/10 text-white/40 rounded-md">Hidden</span>}
                            </span>
                        </div>

                        {/* Right: Garbage, Visibility Toggle & Expand Toggle */}
                        <div className="flex items-center gap-1">
                            {/* Garbage Icon (Move to left of toggle) */}
                            <button
                                onClick={handleRemoveClick}
                                className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center"
                                aria-label="Remove section"
                                data-testid={`remove-btn-${id}`}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                                </svg>
                            </button>

                            {/* Visibility Toggle Switch */}
                            <div
                                className="flex items-center px-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleVisibility?.();
                                }}
                            >
                                <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 p-1 ${isVisible ? 'bg-white' : 'bg-white/10'}`}>
                                    <div className={`w-3 h-3 rounded-full transition-transform duration-200 ${isVisible ? 'translate-x-4 bg-hky-black' : 'translate-x-0 bg-white/40'}`} />
                                </div>
                            </div>

                            {/* Chevron */}
                            <div className={`p-2 text-white/40 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content - Expandable */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded || isHero ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className={isHero ? 'p-0' : 'p-0 sm:p-2'}>
                        {children}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm overscroll-none touch-none" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-hky-black border border-white/[0.1] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 flex items-center justify-center text-red-400">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">Delete {label}?</h3>
                        </div>
                        <p className="text-white/60 text-sm mb-6">
                            Are you sure you want to remove this section? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-400 rounded-xl transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
