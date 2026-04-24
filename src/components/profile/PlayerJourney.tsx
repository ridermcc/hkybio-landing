'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface JourneyStop {
    id?: string
    teamName: string
    league: string
    years: string
    seasons: number
    accolades?: string[]
    // Edit-mode fields
    startYear?: number
    endYear?: number
}

export interface JourneyEditData {
    stops: JourneyStop[]
}

interface PlayerJourneyProps {
    stops: JourneyStop[]
    isEditing?: boolean
    onChange?: (data: JourneyEditData) => void
}

function SortableJourneyStopCard({
    stop,
    index,
    isExpanded,
    onToggleExpand,
    updateStop,
    removeStop,
    updateAccolade,
    addAccolade,
    removeAccolade
}: {
    stop: JourneyStop
    index: number
    isExpanded: boolean
    onToggleExpand: () => void
    updateStop: (index: number, field: string, value: any) => void
    removeStop: (index: number) => void
    updateAccolade: (stopIndex: number, accIndex: number, value: string) => void
    addAccolade: (stopIndex: number) => void
    removeAccolade: (stopIndex: number, accIndex: number) => void
}) {
    // Generate a stable ID if stop.id doesn't exist. Usually DndKit needs string IDs.
    const id = stop.id || `stop-${index}`

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

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex flex-col bg-black/40 rounded-xl border border-white/[0.1] relative mb-2 group/stop shadow-sm overflow-hidden transition-all ${isDragging ? 'opacity-50 border-white/30 scale-[1.02]' : ''}`}
        >
            <div
                onClick={onToggleExpand}
                className={`flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-white/[0.04] transition-colors ${isExpanded ? 'bg-white/[0.05]' : 'bg-transparent'}`}
            >
                {/* Drag Handle & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()} // Prevent expansion when grabbing handle
                        className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 p-2.5 -ml-2.5 transition-colors touch-none"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
                            <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                    </button>

                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white truncate w-full">
                            {stop.teamName || 'New Team'}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-white/40">
                            <span className="truncate">{stop.league || 'League'}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <span>{stop.startYear || new Date().getFullYear()} – {stop.endYear || 'Present'}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true) }}
                        className={`w-7 h-7 rounded-full transition-colors flex items-center justify-center ${isExpanded ? 'text-red-400' : 'text-white/20 opacity-100 lg:opacity-0 lg:group-hover/stop:opacity-100 hover:bg-red-500/10 hover:text-red-400'}`}
                        title="Remove stop"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                    <svg className={`w-4 h-4 text-white/20 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white/60' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Expanded Editor */}
            {isExpanded && (
                <div className="flex flex-col gap-4 p-4 bg-transparent animate-fade-in-down cursor-default" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-3">
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Team Name</label>
                            <input
                                type="text"
                                value={stop.teamName}
                                onChange={e => updateStop(index, 'teamName', e.target.value)}
                                placeholder="e.g. Toronto Maple Leafs"
                                className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">League</label>
                            <input
                                type="text"
                                value={stop.league}
                                onChange={e => updateStop(index, 'league', e.target.value)}
                                placeholder="e.g. NHL"
                                className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex flex-col gap-1.5 flex-1 min-w-[30%]">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Start Year</label>
                            <input
                                type="number"
                                value={stop.startYear || ''}
                                onChange={e => updateStop(index, 'startYear', parseInt(e.target.value) || 0)}
                                placeholder="YYYY"
                                className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-[2]">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">End Year (Leave blank for Present)</label>
                            <input
                                type="number"
                                value={stop.endYear || ''}
                                onChange={e => updateStop(index, 'endYear', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="YYYY or blank"
                                className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                            />
                        </div>
                    </div>

                    {/* Accolades section inside expanded card */}
                    <div className="flex flex-col gap-2 mt-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center justify-between">
                            Accolades
                            <button
                                type="button"
                                onClick={() => addAccolade(index)}
                                className="text-[10px] font-bold text-white hover:text-white/80 transition-colors uppercase py-1 px-2.5 bg-white/10 rounded-md border border-white/20"
                            >
                                + Add Award
                            </button>
                        </label>

                        {(stop.accolades && stop.accolades.length > 0) ? (
                            <div className="flex flex-wrap gap-2">
                                {stop.accolades.map((accolade, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-black/40 border border-white/[0.1] focus-within:border-white/50 rounded-lg px-2.5 py-1.5 flex-1 min-w-[200px]">
                                        <input
                                            type="text"
                                            value={accolade}
                                            onChange={e => updateAccolade(index, i, e.target.value)}
                                            className="w-full bg-transparent text-xs text-white placeholder-white/20 outline-none"
                                            placeholder="e.g. Calder Trophy Winner"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAccolade(index, i)}
                                            className="text-white/20 hover:text-red-400 flex-shrink-0"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full flex items-center justify-center py-4 border border-dashed border-white/[0.08] rounded-lg">
                                <span className="text-white/20 text-xs text-center">No accolades listed</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm overscroll-none touch-none" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}>
                    <div className="bg-hky-black border border-white/[0.1] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 flex items-center justify-center text-red-400">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">Delete {stop.teamName || 'stop'}?</h3>
                        </div>
                        <p className="text-white/60 text-sm mb-6 mt-2">
                            Are you sure you want to remove this stop? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeStop(index); setShowDeleteConfirm(false); }}
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

export function PlayerJourney({ stops, isEditing = false, onChange }: PlayerJourneyProps) {
    const [expandedStopIndex, setExpandedStopIndex] = useState<number | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 8 } }),
        useSensor(KeyboardSensor)
    )

    if (!stops || stops.length === 0) {
        if (isEditing) {
            return (
                <div className="w-full px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
                    <div className="border border-dashed border-white/[0.08] rounded-xl py-10 flex flex-col items-center gap-3 transition-colors bg-transparent">
                        <span className="text-white/30 text-[13px]">No career stops added</span>
                        <button
                            onClick={() => {
                                onChange?.({ stops: [{ id: `stop-${Date.now()}`, teamName: '', league: '', years: '', seasons: 0, startYear: new Date().getFullYear(), accolades: [] }] })
                                setExpandedStopIndex(0)
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 mt-1 rounded-lg text-xs font-bold tracking-wide border border-dashed border-white/[0.15] text-white/60 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.3] transition-all active:scale-[0.98]"
                            data-testid="add-stop"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add Stop
                        </button>
                    </div>
                </div>
            )
        }
        return null
    }

    const updateStop = (index: number, field: string, value: any) => {
        if (!onChange) return
        const updated = [...stops]
        updated[index] = { ...updated[index], [field]: value }

        // Recalculate years string and seasons count
        if (field === 'startYear' || field === 'endYear') {
            const start = field === 'startYear' ? value : updated[index].startYear
            const end = field === 'endYear' ? value : updated[index].endYear
            updated[index].years = end ? `${start}–${end}` : `${start}–Present`
            updated[index].seasons = end ? end - start : new Date().getFullYear() - (start || new Date().getFullYear())
        }

        onChange({ stops: updated })
    }

    const addStop = () => {
        if (!onChange) return
        const newStop = { id: `stop-${Date.now()}`, teamName: '', league: '', years: '', seasons: 0, startYear: new Date().getFullYear(), accolades: [] }
        onChange({
            stops: [...stops, newStop],
        })
        setExpandedStopIndex(stops.length)
    }

    const removeStop = (index: number) => {
        if (!onChange) return
        onChange({ stops: stops.filter((_, i) => i !== index) })
        if (expandedStopIndex === index) setExpandedStopIndex(null)
        else if (expandedStopIndex !== null && expandedStopIndex > index) setExpandedStopIndex(expandedStopIndex - 1)
    }

    const addAccolade = (stopIndex: number) => {
        if (!onChange) return
        const updated = [...stops]
        updated[stopIndex] = {
            ...updated[stopIndex],
            accolades: [...(updated[stopIndex].accolades || []), ''],
        }
        onChange({ stops: updated })
    }

    const updateAccolade = (stopIndex: number, accIndex: number, value: string) => {
        if (!onChange) return
        const updated = [...stops]
        const accolades = [...(updated[stopIndex].accolades || [])]
        accolades[accIndex] = value
        updated[stopIndex] = { ...updated[stopIndex], accolades }
        onChange({ stops: updated })
    }

    const removeAccolade = (stopIndex: number, accIndex: number) => {
        if (!onChange) return
        const updated = [...stops]
        updated[stopIndex] = {
            ...updated[stopIndex],
            accolades: (updated[stopIndex].accolades || []).filter((_, i) => i !== accIndex),
        }
        onChange({ stops: updated })
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id || !onChange) return

        // Create ensure IDs exist for searching
        const stopsWithIds = stops.map((s, i) => ({ ...s, _tempId: s.id || `stop-${i}` }))

        const oldIndex = stopsWithIds.findIndex((s) => s._tempId === active.id)
        const newIndex = stopsWithIds.findIndex((s) => s._tempId === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
            // Track expanded element to maintain it after sorting
            let newExpandedIndex = expandedStopIndex
            if (expandedStopIndex === oldIndex) {
                newExpandedIndex = newIndex
            } else if (expandedStopIndex !== null) {
                if (oldIndex < expandedStopIndex && newIndex >= expandedStopIndex) {
                    newExpandedIndex = expandedStopIndex - 1
                } else if (oldIndex > expandedStopIndex && newIndex <= expandedStopIndex) {
                    newExpandedIndex = expandedStopIndex + 1
                }
            }

            setExpandedStopIndex(newExpandedIndex)
            onChange({ stops: arrayMove(stops, oldIndex, newIndex) })
        }
    }

    if (isEditing && onChange) {
        // Ensure all stops have IDs for DndKit
        const draggableStops = stops.map((s, i) => ({ ...s, id: s.id || `stop-${i}` }))

        return (
            <div className="w-full px-4 pb-4 pt-1 sm:px-5 sm:pb-5 flex flex-col gap-4">
                <div className="flex flex-col">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={draggableStops.map(s => s.id as string)}
                            strategy={verticalListSortingStrategy}
                        >
                            {draggableStops.map((stop, index) => (
                                <SortableJourneyStopCard
                                    key={stop.id}
                                    stop={stop}
                                    index={index}
                                    isExpanded={expandedStopIndex === index}
                                    onToggleExpand={() => setExpandedStopIndex(expandedStopIndex === index ? null : index)}
                                    updateStop={updateStop}
                                    removeStop={removeStop}
                                    updateAccolade={updateAccolade}
                                    addAccolade={addAccolade}
                                    removeAccolade={removeAccolade}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <button
                        type="button"
                        onClick={addStop}
                        className="flex items-center justify-center gap-2 py-2 mt-2 rounded-lg text-[13px] font-bold tracking-wide border border-dashed border-white/[0.15] text-white/50 hover:text-white/80 hover:bg-white/[0.05] hover:border-white/[0.3] transition-all active:scale-[0.98]"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Stop
                    </button>
                </div>
            </div>
        )
    }

    return (
        <section className={`w-full px-4 py-1.5 lg:px-0 lg:py-0 ${!onChange ? 'animate-fade-up opacity-0' : ''}`} style={!onChange ? { animationDelay: '600ms', animationFillMode: 'forwards' } : undefined}>
            <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-xl py-6 px-4 flex flex-col items-center shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col w-full z-10">
                    {stops.map((stop, index) => (
                        <React.Fragment key={index}>
                            <div className="py-4 first:pt-0 last:pb-0 flex flex-col">
                                <div className="flex items-start sm:items-center justify-between gap-4">
                                    <h3 className="text-[16px] sm:text-[18px] font-extrabold text-white leading-tight tracking-tight">
                                        {stop.teamName}
                                    </h3>
                                    <span className="flex-shrink-0 text-[13px] font-semibold text-white/50 tabular-nums">
                                        {stop.years}
                                    </span>
                                </div>

                                <div className="mt-1">
                                    <p className="text-[13px] font-semibold text-white/60">
                                        {stop.league} {stop.seasons > 0 && <><span className="text-white/20 mx-1.5">|</span> {stop.seasons} {stop.seasons === 1 ? 'Season' : 'Seasons'}</>}
                                    </p>
                                </div>

                                {stop.accolades && stop.accolades.length > 0 && (
                                    <div className="mt-2 flex flex-wrap items-center gap-1">
                                        {stop.accolades.map((accolade, i) => (
                                            <React.Fragment key={i}>
                                                <span className="text-[11px] font-semibold text-white/50">
                                                    {accolade}
                                                </span>
                                                {i < stop.accolades!.length - 1 && (
                                                    <span className="text-white/20 mx-1.5 text-[11px]">|</span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {index < stops.length - 1 && (
                                <div className="w-full h-px bg-white/[0.06] my-1" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    )
}
