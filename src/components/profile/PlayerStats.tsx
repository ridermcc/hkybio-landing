'use client';

import React from 'react';

interface PlayerBio {
    birthYear?: number;
    position?: string;
    shoots?: string;
    height?: string;
    weight?: string;
}

interface PlayerStatsProps {
    stats: Record<string, string | number>;
    season?: string;
    league?: string;
    bio?: PlayerBio;
}

export function PlayerStats({ stats, season, league, bio }: PlayerStatsProps) {
    const contextLabel = season || '';
    const entries = Object.entries(stats);

    // Build bio items — only include defined values
    const bioItems: { label: string; value: string }[] = [];
    if (bio?.position) bioItems.push({ label: 'Pos', value: bio.position });
    if (bio?.shoots) bioItems.push({ label: 'Shoots', value: bio.shoots });
    if (bio?.height) bioItems.push({ label: 'Ht', value: bio.height });
    if (bio?.weight) bioItems.push({ label: 'Wt', value: bio.weight });
    if (bio?.birthYear) bioItems.push({ label: 'Born', value: String(bio.birthYear) });

    return (
        <section className="w-full px-4 py-4 animate-fade-up opacity-0" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
            <div className="relative border border-white/[0.08] rounded-2xl py-6 flex flex-col items-center">

                {contextLabel && (
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center px-4 bg-hky-black whitespace-nowrap z-10">
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">{contextLabel}</span>
                    </div>
                )}

                {/* Performance stats */}
                <div className="flex items-baseline justify-center gap-6 sm:gap-10 px-4">
                    {entries.map(([key, value], index) => (
                        <React.Fragment key={key}>
                            <div className="flex flex-col items-center">
                                <span className="text-[28px] sm:text-[32px] font-extrabold text-white tabular-nums leading-none tracking-tight">
                                    {value}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mt-1">
                                    {key}
                                </span>
                            </div>
                            {index < entries.length - 1 && (
                                <div className="w-px h-6 bg-white/[0.08] self-center" />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Bio details row — inside card below divider */}
                {bioItems.length > 0 && (
                    <>
                        <div className="mt-4" />
                        <div className="flex items-center justify-center gap-4 sm:gap-6 px-4">
                            {bioItems.map((item, index) => (
                                <React.Fragment key={item.label}>
                                    <span className="text-[13px] font-medium text-white/60 tabular-nums leading-none">
                                        {item.value}
                                    </span>
                                    {index < bioItems.length - 1 && (
                                        <div className="w-px h-4 bg-white/[0.06] self-center" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}