import React from 'react';

interface PlayerTeamBadgeProps {
    teamName?: string;
    teamLogoUrl?: string;
    leagueName?: string;
    leagueLogoUrl?: string;
}

export function PlayerTeamBadge({
    teamName,
    teamLogoUrl,
    leagueName,
    leagueLogoUrl,
}: PlayerTeamBadgeProps) {
    if (!teamName) return null;

    return (
        <div className="w-full px-4 pt-3 sm:px-6">
            <div className="w-full flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/[0.08]">
                {teamLogoUrl && (
                    <img
                        src={teamLogoUrl}
                        alt={teamName}
                        className="w-5 h-5 object-contain shrink-0 rounded"
                    />
                )}
                <span className="text-[13px] font-semibold tracking-tight text-white/80 truncate">
                    {teamName}
                </span>
                {leagueName && (
                    <>
                        <span className="text-white/20 text-[10px]">·</span>
                        <span className="text-[11px] font-medium text-white/40 shrink-0">
                            {leagueName}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
