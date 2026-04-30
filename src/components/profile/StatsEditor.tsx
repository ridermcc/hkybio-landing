'use client'

import React, { useId } from 'react'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    horizontalListSortingStrategy,
    arrayMove,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { StatItem, StatsEditData } from './PlayerStats'

interface PlayerBio {
    birthYear?: number
    position?: string
    shoots_catches?: string
    height?: string
    weight?: string
}

interface StatsEditorProps {
    stats: StatItem[]
    season?: string
    bio: PlayerBio
    showBio?: boolean
    onChange: (data: StatsEditData) => void
}



/* ── Position-aware presets ── */
const SKATER_PRESETS = [
    { label: 'GP', name: 'Games Played' },
    { label: 'G', name: 'Goals' },
    { label: 'A', name: 'Assists' },
    { label: 'PTS', name: 'Points (auto-calculated)' },
    { label: '+/-', name: 'Plus/Minus' },
    { label: 'PIM', name: 'Penalty Minutes' },
    { label: 'PPG', name: 'Power Play Goals' },
    { label: 'SHG', name: 'Short Handed Goals' },
    { label: 'GWG', name: 'Game Winning Goals' },
]

const GOALIE_PRESETS = [
    { label: 'GP', name: 'Games Played' },
    { label: 'W-L-T', name: 'Record (Wins-Losses-Ties)' },
    { label: 'GAA', name: 'Goals Against Avg' },
    { label: 'SV%', name: 'Save Percentage' },
    { label: 'SO', name: 'Shutouts' },
]

const MAX_STATS = 4

const POSITION_OPTIONS = ['C', 'LW', 'RW', 'D', 'G']
const SHOOTS_OPTIONS = ['L', 'R']

/* ── Season options (2000-01 to 2025-26, newest first) ── */
const DEFAULT_SEASON = '2025-26'
const SEASON_OPTIONS: string[] = (() => {
    const seasons: string[] = []
    for (let start = 2025; start >= 2000; start--) {
        const end = String(start + 1).slice(-2)
        seasons.push(`${start}-${end}`)
    }
    return seasons
})()

/* ── Height options (4'0 to 6'11) ── */
const HEIGHT_OPTIONS: string[] = []
for (let ft = 4; ft <= 6; ft++) {
    const maxIn = ft === 6 ? 11 : 11
    for (let inch = 0; inch <= maxIn; inch++) {
        HEIGHT_OPTIONS.push(`${ft}'${inch}`)
    }
}

/* ── Weight options (100–300 lbs, step 5) ── */
const WEIGHT_OPTIONS: number[] = []
for (let w = 90; w <= 260; w += 1) {
    WEIGHT_OPTIONS.push(w)
}

const selectChevronStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 12px center',
    paddingRight: '32px',
}

const inputClasses = 'w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50 transition-colors placeholder:text-white/20'
const selectClasses = `${inputClasses} appearance-none cursor-pointer`

/* ── Sortable stat card ── */
function SortableStatCard({
    stat,
    index,
    isMandatory,
    isAutoCalc,
    isPreset,
    onUpdate,
    onRemove,
}: {
    stat: StatItem
    index: number
    isMandatory: boolean
    isAutoCalc: boolean
    isPreset: boolean
    onUpdate: (index: number, field: keyof StatItem, value: string) => void
    onRemove: (index: number) => void
}) {
    const sortableId = stat.id || `stat-${index}`
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: sortableId })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 'auto' as any,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            // Use flex column with space-between so top area, middle value, and bottom label are stacked and balanced
            className={`group relative flex flex-col items-center justify-between pb-4 sm:pb-5 px-2 sm:px-3 bg-black/40 rounded-2xl border transition-all flex-1 min-w-0 min-h-[105px]
                ${isDragging ? 'border-white/30 shadow-sm opacity-50 scale-[1.02]' : 'border-white/[0.1] hover:border-white/[0.14] hover:bg-white/[0.05]'}`}
            data-testid={`stat-card-${index}`}
        >
            {/* Drag handle — top full width & centered */}
            <div className="w-full flex justify-center pt-2 pb-1.5">
                <button
                    {...attributes}
                    {...listeners}
                    className="w-full h-8 flex items-center justify-center text-white/20 cursor-grab active:cursor-grabbing transition-colors hover:text-white/40 touch-none"
                    aria-label="Drag to reorder"
                    data-testid={`drag-stat-${index}`}
                >
                    <svg width="24" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="5" r="1.5" />
                        <circle cx="15" cy="5" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="19" r="1.5" />
                        <circle cx="15" cy="19" r="1.5" />
                    </svg>
                </button>
            </div>

            {/* Value input (wrapped to occupy consistent middle flex space) */}
            <div className="flex-1 flex items-center justify-center w-full">
                <input
                    type="text"
                    inputMode={(() => {
                        if (isAutoCalc) return undefined
                        const label = stat.label.toUpperCase()

                        // GAA, SV%, and any custom stat get decimal (for the "." key)
                        const isPreset = [...SKATER_PRESETS, ...GOALIE_PRESETS].some(p => p.label.toUpperCase() === label)
                        if (label === 'GAA' || label === 'SV%' || !isPreset) return 'decimal'

                        // W-L-T and +/- need symbols. Tel failed to provide "-" on some devices, so fallback to text
                        if (label === 'W-L-T' || label === '+/-') return 'text'

                        return 'numeric'
                    })()}
                    value={String(stat.value)}
                    onChange={e => {
                        if (!isAutoCalc) {
                            const val = e.target.value
                            const isWLT = stat.label.toUpperCase() === 'W-L-T'

                            // 1. allow numbers, decimals, +, -, and %
                            let sanitized = val.replace(/[^0-9%.+-]/g, '')

                            // 2. Conflict check: Don't allow both + and -
                            if (sanitized.includes('+') && sanitized.includes('-')) {
                                const lastChar = val.slice(-1)
                                if (lastChar === '+') sanitized = sanitized.replace(/-/g, '')
                                else if (lastChar === '-') sanitized = sanitized.replace(/\+/g, '')
                                else sanitized = sanitized.replace(/\+/g, '') // Fallback
                            }

                            // 3. Max counts
                            const percentParts = sanitized.split('%')
                            if (percentParts.length > 2) {
                                sanitized = percentParts[0] + '%' + percentParts.slice(1).join('')
                            }
                            const plusParts = sanitized.split('+')
                            if (plusParts.length > 2) {
                                sanitized = plusParts[0] + '+' + plusParts.slice(1).join('')
                            }
                            // Only restrict to one '-' if NOT W-L-T
                            if (!isWLT) {
                                const minusParts = sanitized.split('-')
                                if (minusParts.length > 2) {
                                    sanitized = minusParts[0] + '-' + minusParts.slice(1).join('')
                                }
                            }

                            onUpdate(index, 'value', sanitized)
                        }
                    }}
                    placeholder="0"
                    readOnly={isAutoCalc}
                    maxLength={stat.label.toUpperCase() === 'W-L-T' ? 10 : 4}
                    className={`w-full text-center bg-transparent border-none outline-none text-white text-3xl font-extrabold tabular-nums transition-colors placeholder:text-white/[0.12] ${isAutoCalc ? 'text-white/60 cursor-default' : ''}`}
                    data-testid={`stat-value-${index}`}
                />
            </div>

            {/* Label area (fixed height or aligned bottom to ensure text lines up) */}
            <div className="w-full flex-none flex flex-col items-center justify-end min-h-[28px] mt-1.5">
                {!isPreset ? (
                    <div className="w-full relative">
                        <input
                            type="text"
                            value={stat.label}
                            onChange={e => onUpdate(index, 'label', e.target.value.toUpperCase())}
                            placeholder="STAT"
                            className="w-full text-center bg-transparent border-b border-b-white/[0.08] focus:border-b-white/50 outline-none text-white/80 text-[11px] font-bold uppercase tracking-[0.12em] py-0.5 transition-colors placeholder:text-white/20"
                            maxLength={5}
                        />
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center text-center">
                        <span className="text-white/35 text-[11px] font-bold uppercase tracking-[0.12em] py-0.5 select-none leading-none">
                            {stat.label || 'STAT'}
                        </span>
                        {/* Status text (auto/required) forced below the label but layout stays balanced */}
                        {isAutoCalc && <span className="block text-[8px] text-white/60 font-normal normal-case tracking-normal mt-0.5 leading-none">auto</span>}
                        {isMandatory && <span className="block text-[8px] text-white/20 font-normal normal-case tracking-normal mt-0.5 leading-none">required</span>}
                    </div>
                )}
            </div>
        </div>
    )
}

export function StatsEditor({ stats, season, bio, showBio = false, onChange }: StatsEditorProps) {
    const dndId = useId()
    const [localCustomPresets, setLocalCustomPresets] = React.useState<string[]>([])
    const statMemoryRef = React.useRef<Record<string, string>>({})

    // Cache stat memory whenever stats change
    React.useEffect(() => {
        // Cache values into memory so they can be restored if toggled off and on again
        stats.forEach(s => {
            const label = s.label.trim().toUpperCase()
            if (label && s.value !== undefined && s.value !== '') {
                statMemoryRef.current[label] = String(s.value)
            }
        })
    }, [stats])

    // Initialise season to the default if none is set
    React.useEffect(() => {
        if (!season) {
            onChange({ season: DEFAULT_SEASON, stats, bio: bio || {}, showBio })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const emitChange = (updates: Partial<StatsEditData>) => {
        onChange({
            season: season,
            stats,
            bio: bio || {},
            showBio: showBio,
            ...updates,
        })
    }

    const updateStat = (index: number, field: keyof StatItem, value: string) => {
        const updated = [...stats]
        updated[index] = { ...updated[index], [field]: value }

        // Auto-calculate PTS if G and A exist
        const gStat = updated.find(s => s.label.toUpperCase() === 'G')
        const aStat = updated.find(s => s.label.toUpperCase() === 'A')
        const ptsStat = updated.find(s => s.label.toUpperCase() === 'PTS')
        if (ptsStat && gStat && aStat) {
            const g = parseInt(String(gStat.value)) || 0
            const a = parseInt(String(aStat.value)) || 0
            const ptsIndex = updated.indexOf(ptsStat)
            updated[ptsIndex] = { ...updated[ptsIndex], value: String(g + a) }
        }

        emitChange({ stats: updated })
    }

    const addStat = (label = '', value: string | number = '') => {
        if (stats.length >= MAX_STATS) return

        let initialValue = String(value)
        const upperLabel = label.trim().toUpperCase()

        // Restore value from session memory if available
        if (initialValue === '' && upperLabel && statMemoryRef.current[upperLabel]) {
            initialValue = statMemoryRef.current[upperLabel]
        }

        // When adding PTS and G+A already exist, auto-calculate
        if (upperLabel === 'PTS') {
            const gStat = stats.find(s => s.label.toUpperCase() === 'G')
            const aStat = stats.find(s => s.label.toUpperCase() === 'A')
            if (gStat && aStat) {
                const g = parseInt(String(gStat.value)) || 0
                const a = parseInt(String(aStat.value)) || 0
                initialValue = String(g + a)
            }
        }

        emitChange({ stats: [...stats, { label, value: initialValue, id: `stat-${Date.now()}` }] })
    }

    const removeStat = (index: number) => {
        // Don't allow removing GP for skaters
        const isGoalie = bio?.position === 'G'
        if (!isGoalie && stats[index]?.label.toUpperCase() === 'GP') return

        const removedStat = stats[index]
        if (removedStat) {
            const label = removedStat.label.trim().toUpperCase()
            if (label) {
                const isBasePreset = [...SKATER_PRESETS, ...GOALIE_PRESETS].some(p => p.label.toUpperCase() === label)
                if (!isBasePreset) {
                    setLocalCustomPresets(prev => {
                        if (prev.includes(label)) return prev
                        return [...prev, label]
                    })
                }
            }
        }

        emitChange({ stats: stats.filter((_, i) => i !== index) })
    }

    const updateBio = (field: string, value: string) => {
        const updatedBio = {
            ...bio,
            [field]: field === 'birthYear' ? (value ? parseInt(value) : undefined) : value,
        }

        if (field === 'position') {
            const oldValue = bio?.position
            const isNowGoalie = value === 'G'
            const wasGoalie = oldValue === 'G'
            const wasSkater = oldValue !== undefined && !wasGoalie && oldValue !== ''

            // Only filter if they are actively crossing the Skater <-> Goalie boundary
            if ((wasSkater && isNowGoalie) || (wasGoalie && !isNowGoalie && value !== '')) {
                const newPresets = isNowGoalie ? GOALIE_PRESETS : SKATER_PRESETS
                const validLabels = new Set(newPresets.map(p => p.label.toUpperCase()))

                const isCustom = (label: string) => ![...SKATER_PRESETS, ...GOALIE_PRESETS].some(p => p.label.toUpperCase() === label.toUpperCase())

                const keptStats = stats.filter(s => {
                    const label = s.label.toUpperCase()
                    return validLabels.has(label) || isCustom(label)
                })

                emitChange({
                    bio: updatedBio,
                    stats: keptStats
                })
                return
            }
        }

        emitChange({ bio: updatedBio })
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = stats.findIndex(s => (s.id || `stat-${stats.indexOf(s)}`) === active.id)
        const newIndex = stats.findIndex(s => (s.id || `stat-${stats.indexOf(s)}`) === over.id)
        if (oldIndex === -1 || newIndex === -1) return

        emitChange({ stats: arrayMove(stats, oldIndex, newIndex) })
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
    )

    const usedLabels = new Set(stats.map(s => s.label.toUpperCase()))
    const isGoalie = bio?.position === 'G'
    const presets = isGoalie ? GOALIE_PRESETS : SKATER_PRESETS
    const presetLabel = isGoalie ? 'Goalie Stats' : 'Player Stats'
    const atLimit = stats.length >= MAX_STATS

    // Ensure stats have IDs for DnD
    const statsWithIds = stats.map((s, i) => ({
        ...s,
        id: s.id || `stat-${i}`,
    }))
    const sortableIds = statsWithIds.map(s => s.id!)

    return (
        <div className="flex flex-col gap-5 px-4 pb-4 pt-1 sm:px-5 sm:pb-5" data-testid="stats-editor">

            {/* ── Season selector ── */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-white/25 tracking-[0.05em]">Season</label>
                <select
                    value={season || DEFAULT_SEASON}
                    onChange={e => emitChange({ season: e.target.value })}
                    className={selectClasses}
                    style={selectChevronStyle}
                    data-testid="stats-season"
                >
                    {SEASON_OPTIONS.map(s => (
                        <option key={s} value={s} className="bg-hky-black text-white">{s}</option>
                    ))}
                </select>
            </div>

            {/* ── Quick-add presets ── */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold tabular-nums ${atLimit ? 'text-amber-400/70' : 'text-white/20'}`}>
                        {stats.length}/{MAX_STATS}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2" data-testid="stat-presets">
                    {presets.map(preset => {
                        const statIndex = stats.findIndex(s => s.label.toUpperCase() === preset.label.toUpperCase())
                        const isUsed = statIndex !== -1
                        const isDisabled = !isUsed && atLimit

                        return (
                            <button
                                key={preset.label}
                                onClick={() => {
                                    if (isUsed) {
                                        removeStat(statIndex)
                                    } else if (!isDisabled) {
                                        addStat(preset.label)
                                    }
                                }}
                                className={`px-4 py-2 rounded-lg text-[13px] font-bold tracking-wide border transition-all whitespace-nowrap active:scale-95
                                    ${isUsed
                                        ? 'bg-white/10 text-white border-white/20'
                                        : isDisabled
                                            ? 'bg-transparent border-white/[0.06] text-white/20 cursor-not-allowed'
                                            : 'bg-transparent border-white/[0.1] text-white/60 cursor-pointer hover:border-white/20 hover:bg-white/[0.05] hover:text-white'
                                    }`}
                                disabled={isDisabled}
                                title={isDisabled ? `Max ${MAX_STATS} stats` : preset.name}
                                data-testid={`preset-${preset.label}`}
                            >
                                {preset.label}
                            </button>
                        )
                    })}

                    {/* Render saved local custom presets */}
                    {localCustomPresets.map(customLabel => {
                        const statIndex = stats.findIndex(s => s.label.toUpperCase() === customLabel)
                        const isUsed = statIndex !== -1
                        const isDisabled = !isUsed && atLimit

                        return (
                            <button
                                key={customLabel}
                                onClick={() => {
                                    if (isUsed) {
                                        removeStat(statIndex)
                                    } else if (!isDisabled) {
                                        addStat(customLabel)
                                    }
                                }}
                                className={`px-4 py-2 rounded-lg text-[13px] font-bold tracking-wide border transition-all whitespace-nowrap active:scale-95
                                    ${isUsed
                                        ? 'bg-white/10 text-white border-white/20'
                                        : isDisabled
                                            ? 'bg-transparent border-white/[0.06] text-white/20 cursor-not-allowed'
                                            : 'bg-transparent border-white/[0.1] text-white/60 cursor-pointer hover:border-white/20 hover:bg-white/[0.05] hover:text-white'
                                    }`}
                                disabled={isDisabled}
                                title={isDisabled ? `Max ${MAX_STATS} stats` : `Custom Stat: ${customLabel}`}
                                data-testid={`preset-custom-${customLabel}`}
                            >
                                {customLabel}
                            </button>
                        )
                    })}

                    {/* Render active custom stats that aren't in localCustomPresets (because they are currently being edited/added) */}
                    {stats.map((stat, idx) => {
                        const label = stat.label.trim().toUpperCase()
                        const isBasePreset = [...SKATER_PRESETS, ...GOALIE_PRESETS].some(p => p.label.toUpperCase() === label)
                        if (isBasePreset) return null
                        if (localCustomPresets.includes(label)) return null // Already rendered

                        return (
                            <button
                                key={stat.id || `custom-active-${idx}`}
                                onClick={() => removeStat(idx)}
                                className="px-4 py-2 rounded-lg text-[13px] font-bold tracking-wide border transition-all whitespace-nowrap active:scale-95 bg-white/10 text-white border-white/20"
                                title="Remove Custom Stat"
                            >
                                {stat.label || 'STAT'}
                            </button>
                        )
                    })}

                    {/* Add custom stat button in quick add section */}
                    <button
                        onClick={() => !atLimit && addStat('Custom')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold tracking-wide border border-dashed transition-all whitespace-nowrap active:scale-95
                            ${atLimit
                                ? 'bg-transparent border-white/[0.06] text-white/20 cursor-not-allowed'
                                : 'bg-transparent border-white/[0.15] text-white/40 cursor-pointer hover:border-white/30 hover:bg-white/[0.05] hover:text-white'
                            }`}
                        disabled={atLimit}
                        title={atLimit ? `Max ${MAX_STATS} stats` : 'Add Custom Stat'}
                        data-testid="add-custom-stat"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Custom
                    </button>
                </div>
            </div>

            {/* ── Stats grid (draggable) ── */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/20">drag to reorder</span>
                </div>
                <DndContext
                    id={dndId}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
                        <div className="flex gap-2.5">
                            {statsWithIds.map((stat, index) => {
                                const label = stat.label.toUpperCase()
                                const isMandatory = !isGoalie && label === 'GP'
                                const hasG = usedLabels.has('G')
                                const hasA = usedLabels.has('A')
                                const isAutoCalc = label === 'PTS' && hasG && hasA
                                const isPreset = [...SKATER_PRESETS, ...GOALIE_PRESETS].some(p => p.label.toUpperCase() === label)

                                return (
                                    <SortableStatCard
                                        key={stat.id}
                                        stat={stat}
                                        index={index}
                                        isMandatory={isMandatory}
                                        isAutoCalc={isAutoCalc}
                                        isPreset={isPreset}
                                        onUpdate={updateStat}
                                        onRemove={removeStat}
                                    />
                                )
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* ── Divider ── */}
            <div className="h-px bg-white/[0.06] my-2" />

            {/* ── Bio Details Toggle ── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[10px] text-white/20">Show position, height, weight, etc.</p>
                    </div>
                    <button
                        onClick={() => emitChange({ showBio: !showBio })}
                        className={`relative w-10 h-5 rounded-full transition-colors ${showBio ? 'bg-white' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full transition-transform ${showBio ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/40'}`} />
                    </button>
                </div>

                {showBio && (
                    <div className="grid grid-cols-2 gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Position */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-white/25 tracking-[0.05em]">Position</label>
                            <select
                                value={bio?.position || ''}
                                onChange={e => updateBio('position', e.target.value)}
                                className={selectClasses}
                                style={selectChevronStyle}
                                data-testid="bio-position"
                            >
                                <option value="" className="bg-hky-black text-white">—</option>
                                {POSITION_OPTIONS.map(pos => (
                                    <option key={pos} value={pos} className="bg-hky-black text-white">{pos}</option>
                                ))}
                            </select>
                        </div>

                        {/* Shoots / Catches */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-white/25 tracking-[0.05em]">
                                {isGoalie ? 'Catches' : 'Shoots'}
                            </label>
                            <select
                                value={bio?.shoots_catches || ''}
                                onChange={e => updateBio('shoots_catches', e.target.value)}
                                className={selectClasses}
                                style={selectChevronStyle}
                                data-testid="bio-shoots"
                            >
                                <option value="" className="bg-hky-black text-white">—</option>
                                {SHOOTS_OPTIONS.map(s => (
                                    <option key={s} value={s} className="bg-hky-black text-white">{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Height */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-white/25 tracking-[0.05em]">Height</label>
                            <select
                                value={bio?.height || ''}
                                onChange={e => updateBio('height', e.target.value)}
                                className={selectClasses}
                                style={selectChevronStyle}
                                data-testid="bio-height"
                            >
                                <option value="" className="bg-hky-black text-white">—</option>
                                {HEIGHT_OPTIONS.map(h => (
                                    <option key={h} value={h} className="bg-hky-black text-white">{h}</option>
                                ))}
                            </select>
                        </div>

                        {/* Weight */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-white/25 tracking-[0.05em]">Weight</label>
                            <select
                                value={bio?.weight || ''}
                                onChange={e => updateBio('weight', e.target.value)}
                                className={selectClasses}
                                style={selectChevronStyle}
                                data-testid="bio-weight"
                            >
                                <option value="" className="bg-hky-black text-white">—</option>
                                {WEIGHT_OPTIONS.map(w => (
                                    <option key={w} value={String(w)} className="bg-hky-black text-white">{w} lbs</option>
                                ))}
                            </select>
                        </div>

                        {/* Birth Year */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-white/25 tracking-[0.05em]">Birth Year</label>
                            <input
                                type="number"
                                value={bio?.birthYear || ''}
                                onChange={e => updateBio('birthYear', e.target.value)}
                                placeholder="2006"
                                className={inputClasses}
                                data-testid="bio-birthyear"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
