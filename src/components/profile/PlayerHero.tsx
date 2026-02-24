import React from 'react';

interface PlayerHeroProps {
    playerName?: string;
    username: string;
    imageUrl?: string;
    birthYear?: number;
    position?: string;
    nationality?: string;
    teamName?: string;
    leagueName?: string;
}

export function PlayerHero({
    playerName,
    username,
    imageUrl,
    birthYear,
    position,
    nationality,
    teamName,
    leagueName,
}: PlayerHeroProps) {
    const flagUrl = nationality
        ? `/flags/${nationality.toLowerCase()}.svg`
        : null;

    return (
        <section className="w-full flex flex-col items-center text-center">
            <div className="relative w-full h-80 sm:h-96 bg-white/5 overflow-hidden flex items-center justify-center rounded-none">
                {/* Player photo */}
                <img
                    src={imageUrl}
                    alt={playerName}
                    className="w-full h-full object-cover object-top"
                />

                {/* Gradient overlay */}
                <div className="absolute bottom-0 w-full h-60 bg-gradient-to-b from-transparent via-black/60 to-[#0a0a0f]" />

                {/* Player identity overlay */}
                <div className="absolute bottom-0 w-full flex flex-col items-center px-4 pb-2">
                    {/* Name */}
                    <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-white leading-tight">
                        {playerName}
                    </h1>

                    {/* Pills row */}
                    <div className="flex items-center gap-2 mt-2">
                        {/* Nation / Position / Birth Year pill */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.08]">
                            {flagUrl && (
                                <img
                                    src={flagUrl}
                                    alt={nationality}
                                    className="w-5 h-3.5 object-cover rounded-[2px]"
                                />
                            )}
                            {position && (
                                <>
                                    <span className="text-white/20 text-[10px]">|</span>
                                    <span className="text-[13px] font-semibold tracking-tight text-white/80">
                                        {position}
                                    </span>
                                </>
                            )}
                            {birthYear && (
                                <>
                                    <span className="text-white/20 text-[10px]">|</span>
                                    <span className="text-[13px] font-medium text-white/50">
                                        {birthYear}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Team / League pill */}
                        {teamName && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/[0.08]">
                                <span className="text-[13px] font-semibold tracking-tight text-white/80">
                                    {teamName}
                                </span>
                                {leagueName && (
                                    <>
                                        <span className="text-white/20 text-[10px]">|</span>
                                        <span className="text-[13px] font-medium text-white/50">
                                            {leagueName}
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}