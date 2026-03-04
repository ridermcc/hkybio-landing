import React from 'react';
import { PlayerLinks } from './PlayerLinks';

interface PlayerLink {
    platform: string;
    url: string;
    logo_url?: string;
}

interface PlayerHeroProps {
    playerName?: string;
    username: string;
    imageUrl?: string;
    nationality?: string;
    teamName?: string;
    leagueName?: string;
    socialLinks?: PlayerLink[];
}

export function PlayerHero({
    playerName,
    username,
    imageUrl,
    nationality,
    teamName,
    leagueName,
    socialLinks,
}: PlayerHeroProps) {
    const flagUrl = nationality
        ? `/flags/${nationality.toLowerCase()}.svg`
        : null;

    return (
        <section className="w-full px-4 pt-6 pb-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.12] transition-colors">
                {/* Photo */}
                <div className="relative w-full aspect-[4/5] max-h-[400px]">
                    <img
                        src={imageUrl}
                        alt={playerName}
                        className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute bottom-0 w-full h-40 bg-gradient-to-b from-transparent via-black/50 to-[#0a0a0f]" />
                </div>

                {/* Identity + links — inside the card */}
                <div className="flex flex-col items-center text-center px-4 pt-1 pb-4 bg-hky-black">
                    <h1 className="text-[28px] sm:text-[34px] font-extrabold tracking-tight text-white leading-tight">
                        {playerName}
                    </h1>
                    {teamName && (
                        <div className="flex items-center gap-2 px-3 py-1">
                            {flagUrl && (
                                <img
                                    src={flagUrl}
                                    alt={nationality}
                                    className="w-5 h-3.5 object-cover rounded-[2px]"
                                />
                            )}
                            <span className="text-white/20 text-[10px]">|</span>
                            <span className="text-[13px] font-bold tracking-tight text-white/80">
                                {teamName}
                            </span>
                            {leagueName && (
                                <>
                                    <span className="text-white/20 text-[10px]">|</span>
                                    <span className="text-[13px] font-semibold text-white/50">
                                        {leagueName}
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Player links */}
                    <PlayerLinks
                        links={socialLinks || []}
                    />
                </div>
            </div>
        </section>
    );
}