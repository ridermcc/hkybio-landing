'use client'
import React, { useState, useEffect } from 'react';
import { Game } from "@/lib/llm-schedule"

export interface ScheduleEditData {
    scheduleUrl: string
    games?: any[]
}

interface PlayerScheduleProps {
    playerId: string
    scheduleUrl?: string
    games?: any[]
    isEditing?: boolean
    onChange?: (data: ScheduleEditData) => void
}

export function PlayerSchedule({ playerId, scheduleUrl, games: initialGames = [], isEditing = false, onChange }: PlayerScheduleProps) {
    const initialMapped = React.useMemo(() => {
        return initialGames.map(g => {
            let formattedDate = ''
            const rawDate = g.date || g.game_date
            if (rawDate) {
                formattedDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate
            }

            return {
                id: g.id,
                opponent: g.opponent || '',
                date: formattedDate,
                time: g.time || g.game_time || '',
                location: g.location || '',
                isHome: g.isHome !== undefined ? g.isHome : g.is_home
            }
        })
    }, [initialGames])

    const [games, setGames] = useState<any[]>(initialMapped)
    const [loading, setLoading] = useState(false)
    const [expandedGameIndex, setExpandedGameIndex] = useState<number | null>(null)

    // Update internal state when props change
    useEffect(() => {
        setGames(initialMapped)
    }, [initialMapped])

    const handleSync = async () => {
        if (!scheduleUrl) return
        setLoading(true)
        try {
            const res = await fetch(`/api/schedule?url=${encodeURIComponent(scheduleUrl)}&playerId=${playerId}`)
            const data = await res.json()
            if (data.games) {
                const mapped = data.games.map((g: any) => ({
                    opponent: g.opponent,
                    date: g.date,
                    time: g.time,
                    location: g.location,
                    isHome: g.isHome,
                }))
                // Sort chronologically
                const sorted = mapped.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                setGames(sorted)
                onChange?.({ scheduleUrl, games: sorted })
                setExpandedGameIndex(null)
            }
        } catch (err) {
            console.error('Failed to sync schedule', err)
            alert('Failed to sync schedule. Check the URL and try again.')
        } finally {
            setLoading(false)
        }
    }

    const updateGame = (index: number, field: string, value: any) => {
        const updated = [...games]
        updated[index] = { ...updated[index], [field]: value }
        setGames(updated)
        onChange?.({ scheduleUrl: scheduleUrl || '', games: updated })
    }

    const removeGame = (index: number) => {
        const updated = games.filter((_, i) => i !== index)
        setGames(updated)
        if (expandedGameIndex === index) setExpandedGameIndex(null)
        else if (expandedGameIndex !== null && expandedGameIndex > index) setExpandedGameIndex(expandedGameIndex - 1)
        onChange?.({ scheduleUrl: scheduleUrl || '', games: updated })
    }

    const addGame = () => {
        const updated = [...games, {
            opponent: '',
            date: new Date().toISOString().split('T')[0],
            time: '19:00',
            location: '',
            isHome: true
        }]
        setGames(updated)
        onChange?.({ scheduleUrl: scheduleUrl || '', games: updated })
        setExpandedGameIndex(updated.length - 1)
    }

    if (isEditing) {
        return (
            <div className="w-full px-4 pb-4 pt-1 sm:px-5 sm:pb-5 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="url"
                            value={scheduleUrl || ''}
                            onChange={e => onChange?.({ scheduleUrl: e.target.value, games })}
                            placeholder="https://www.eliteprospects.com/team/..."
                            className="flex-1 bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50 transition-colors placeholder:text-white/20"
                        />
                        <button
                            type="button"
                            onClick={handleSync}
                            disabled={loading || !scheduleUrl}
                            className={`px-6 py-2 rounded-lg text-[11px] sm:text-[13px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                                ${loading || !scheduleUrl
                                    ? 'bg-transparent text-white/20 cursor-not-allowed border border-white/[0.06]'
                                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 active:scale-95'}`}
                        >
                            {loading ? 'Parsing...' : 'Sync Games'}
                        </button>
                    </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-2">
                        {games.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-white/[0.08] rounded-xl">
                                <span className="text-white/30 text-[13px]">No games added. Click "Sync Games" or add manually.</span>
                            </div>
                        ) : games.map((game, index) => {
                            const isExpanded = expandedGameIndex === index

                            // Format date for display
                            let displayDate = ''
                            if (game.date) {
                                // Add fake time so Date parses exactly as local day
                                const dateObj = new Date(game.date + 'T12:00:00')
                                displayDate = isNaN(dateObj.getTime()) ? game.date : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                            }

                            return (
                                <div key={index} className="flex flex-col bg-white/[0.03] rounded-xl border border-white/[0.08] relative group/game shadow-sm overflow-hidden transition-all">
                                    <div
                                        onClick={() => setExpandedGameIndex(isExpanded ? null : index)}
                                        className={`flex items-center justify-between p-3 cursor-pointer hover:bg-white/[0.04] transition-colors ${isExpanded ? 'border-b border-white/[0.06] bg-white/[0.05]' : 'bg-transparent'}`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <span className={`flex-shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none ${game.isHome ? 'bg-white/[0.08] text-white' : 'bg-transparent border border-white/[0.08] text-white/50'}`}>
                                                {game.isHome ? 'VS' : '@'}
                                            </span>
                                            <span className="text-sm font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]">
                                                {game.opponent || 'TBD'}
                                            </span>
                                            {displayDate && (
                                                <span className="text-[11px] font-medium text-white/30 whitespace-nowrap hidden sm:inline-block ml-2">
                                                    {displayDate}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {displayDate && (
                                                <span className="text-[11px] font-medium text-white/30 whitespace-nowrap sm:hidden">
                                                    {displayDate}
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeGame(index) }}
                                                className={`w-6 h-6 rounded-full transition-colors flex items-center justify-center ${isExpanded ? 'text-red-400' : 'text-white/20 opacity-100 lg:opacity-0 lg:group-hover/game:opacity-100 hover:bg-red-500/10 hover:text-red-400'}`}
                                                title="Remove game"
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

                                    {isExpanded && (
                                        <div className="flex flex-col gap-2.5 p-3 sm:p-4 bg-transparent animate-fade-in-down">
                                            <div className="flex flex-col sm:flex-row gap-2.5">
                                                {/* Toggle H/A and Opponent */}
                                                <div className="flex gap-2 w-full sm:w-[50%]">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateGame(index, 'isHome', !game.isHome)}
                                                        className={`w-12 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors
                                                            ${game.isHome
                                                                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                                                : 'bg-black/40 border-white/[0.1] text-white/40 hover:bg-black/60'}`}
                                                    >
                                                        {game.isHome ? 'vs.' : '@'}
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={game.opponent}
                                                        onChange={e => updateGame(index, 'opponent', e.target.value)}
                                                        placeholder="Opponent"
                                                        className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                                                    />
                                                </div>

                                                {/* Date, Time, Location */}
                                                <div className="flex gap-2 w-full sm:w-[50%]">
                                                    <input
                                                        type="date"
                                                        value={game.date}
                                                        onChange={e => updateGame(index, 'date', e.target.value)}
                                                        className="w-1/3 min-w-[40px] appearance-none bg-black/40 border border-white/[0.1] rounded-lg px-2 sm:px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={game.time}
                                                        onChange={e => updateGame(index, 'time', e.target.value)}
                                                        placeholder="Time (e.g. 7:00 PM)"
                                                        className="w-1/3 min-w-[40px] appearance-none bg-black/40 border border-white/[0.1] rounded-lg px-2 sm:px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={game.location || ''}
                                                        onChange={e => updateGame(index, 'location', e.target.value)}
                                                        placeholder="Location"
                                                        className="w-1/3 min-w-[40px] bg-black/40 border border-white/[0.1] rounded-lg px-2 sm:px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                                                    />
                                                </div>
                                            </div>

                                            {/* Explicit Remove Button for Mobile */}
                                            <div className="flex justify-end mt-1 sm:hidden">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeGame(index) }}
                                                    className="text-[11px] font-bold text-red-500/80 hover:text-red-400 bg-red-500/10 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                    </svg>
                                                    Remove Game
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        <button
                            type="button"
                            onClick={addGame}
                            className="flex items-center justify-center gap-2 py-2 mt-1 rounded-lg text-[13px] font-bold tracking-wide border border-dashed border-white/[0.15] text-white/40 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.3] transition-all active:scale-[0.98]"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add Game
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingSchedule = games.filter(game => {
        if (!game.date) return false
        const gameDate = new Date(game.date + "T00:00:00")
        gameDate.setHours(0, 0, 0, 0)
        return gameDate >= today
    })

    if (upcomingSchedule.length === 0) {
        return null
    }

    const nextGame = upcomingSchedule[0]

    return (
        <section className={`w-full px-4 py-4 lg:py-3 ${!onChange ? 'animate-fade-up opacity-0' : ''}`} style={!onChange ? { animationDelay: '600ms', animationFillMode: 'forwards' } : undefined}>
            {/* Section title */}
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-3 text-center">Schedule</p>

            {/* Next game - floating */}
            <div className="flex flex-col items-center text-center w-full">
                <p className="text-[28px] sm:text-[34px] lg:text-[38px] font-extrabold text-white leading-none tracking-tight mb-4">
                    {nextGame.isHome ? 'vs.' : '@'} {nextGame.opponent}
                </p>

                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-[13px] font-semibold text-white/60 tabular-nums">
                    <span>{new Date(nextGame.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>

                    <div className="w-px h-3 bg-white/[0.08]" />

                    <span>{nextGame.time || 'TBA'}</span>

                    {nextGame.location && (
                        <>
                            <div className="w-px h-3 bg-white/[0.08]" />
                            <span>{nextGame.location}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Full Schedule Link */}
            {scheduleUrl && (
                <div className="mt-4 flex justify-center w-full">
                    <a
                        href={scheduleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 hover:text-white group/link shadow-sm"
                    >
                        Full Schedule
                        <svg className="w-3.5 h-3.5 text-white/30 group-hover/link:text-white/70 transition-colors group-hover/link:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
            )}
        </section>
    )
}