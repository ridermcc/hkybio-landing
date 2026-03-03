'use client'
import React, { useState, useEffect } from 'react';
import { Game } from "@/lib/llm-schedule"

interface PlayerScheduleProps {
    scheduleUrl: string
}

export function PlayerSchedule({ scheduleUrl }: PlayerScheduleProps) {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/schedule?url=${encodeURIComponent(scheduleUrl)}`)
            .then(res => res.json())
            .then(data => {
                setGames(data.games);
                console.log(data.games);
            })
            .catch(err => console.error('Failed to fetch schedule:', err))
            .finally(() => setLoading(false))
    }, [scheduleUrl]);

    if (loading) {
        return (
            <section className="w-full animate-fade-up opacity-0 px-4 py-2" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 h-24 bg-white/[0.03] rounded-xl animate-pulse" />
                    <div className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />
                    <div className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />
                </div>
            </section>
        )
    }

    if (!games || games.length === 0) {
        return null
    }

    const today = new Date()
    console.log("todays date: " + today)
    today.setHours(0, 0, 0, 0)
    console.log(today)

    const upcomingSchedule = games.filter(game => {
        console.log("game.date " + game.opponent + ": " + game.date)
        const gameDate = new Date(game.date + "T00:00:00")
        console.log("Game data hours not set " + game.opponent + ": " + gameDate)
        gameDate.setHours(0, 0, 0, 0)
        console.log("Game date for " + game.opponent + ": " + gameDate)
        return gameDate >= today
    })

    if (upcomingSchedule.length === 0) {
        return null
    }

    const nextGame = upcomingSchedule[0]
    const upcomingGames = upcomingSchedule.slice(1, 3)

    return (
        <section className="w-full animate-fade-up opacity-0 px-4 py-4" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
            <div className="relative border border-white/[0.08] rounded-2xl py-6 px-4 flex flex-col items-center group hover:border-white/[0.12] transition-colors">

                {/* Top Border Label: Next Game */}
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center px-4 bg-hky-black whitespace-nowrap z-10">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">Next Game</span>
                </div>

                <div className="flex flex-col items-center text-center w-full z-10 mt-2 mb-2">
                    <p className="text-[28px] sm:text-[34px] font-extrabold text-white leading-none tracking-tight mb-4">
                        {nextGame.isHome ? 'vs' : '@'} {nextGame.opponent}
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-[13px] font-semibold text-white/60 tabular-nums">
                        <span className="flex items-center gap-1.5">
                            {new Date(nextGame.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                        </span>

                        <div className="w-px h-3 bg-white/[0.08]" />

                        <span className="flex items-center gap-1.5">
                            {nextGame.time || 'TBA'}
                        </span>

                        {nextGame.location && (
                            <>
                                <div className="w-px h-3 bg-white/[0.08] hidden sm:block" />
                                <span className="hidden sm:flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {nextGame.location}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Full Schedule Link */}
                <div className="mt-2 flex justify-center w-full z-10">
                    <a
                        href={scheduleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] transition-all text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white group/link"
                    >
                        Full Schedule
                        <svg className="w-3.5 h-3.5 text-white/30 group-hover/link:text-white/70 transition-colors group-hover/link:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>

            </div>
        </section>
    )
}