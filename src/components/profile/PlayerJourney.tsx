import React from 'react'

interface JourneyStop {
    teamName: string
    league: string
    years: string
    seasons: number
    accolades?: string[]
}

interface PlayerJourneyProps {
    stops: JourneyStop[]
}

export function PlayerJourney({ stops }: PlayerJourneyProps) {
    if (!stops || stops.length === 0) return null

    return (
        <section className="w-full px-4 py-4 animate-fade-up opacity-0" style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}>
            <div className="relative border border-white/[0.08] rounded-2xl py-6 px-4 flex flex-col group hover:border-white/[0.12] transition-colors">

                {/* Top Border Label: Journey */}
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center px-4 bg-hky-black whitespace-nowrap z-10">
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Career</span>
                </div>

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

                                <p className="text-[13px] font-semibold text-white/60 mt-1">
                                    {stop.league} <span className="text-white/20 mx-1.5">|</span> {stop.seasons} {stop.seasons === 1 ? 'Season' : 'Seasons'}
                                </p>

                                {stop.accolades && stop.accolades.length > 0 && (
                                    <div className="mt-2 flex flex-wrap items-center">
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
                                <div className="w-full h-px bg-white/[0.04] my-1" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    )
}

