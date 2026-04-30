'use client';

import React from 'react';
import { StatsEditor } from './StatsEditor';

interface PlayerBio {
    birthYear?: number;
    position?: string;
    shoots_catches?: string;
    height?: string;
    weight?: string;
}

export interface StatItem {
    id?: string;
    label: string;
    value: string | number;
    isVisible?: boolean;
}

export interface StatsEditData {
    season?: string;
    stats: StatItem[];
    bio: PlayerBio;
    showBio?: boolean;
}

interface PlayerStatsProps {
    stats: StatItem[];
    season?: string;
    bio?: PlayerBio;
    showBio?: boolean;
    isEditing?: boolean;
    onChange?: (data: StatsEditData) => void;
}

export function PlayerStats({ stats, season, bio, showBio = false, isEditing = false, onChange }: PlayerStatsProps) {
    const contextLabel = season || '';
    const visibleStats = stats.filter(stat => stat.isVisible !== false);

    // ── Editing mode: delegate to StatsEditor ──
    if (isEditing && onChange) {
        return (
            <div className="w-full px-0 sm:px-2 py-1.5">
                <StatsEditor
                    stats={stats}
                    season={season || ''}
                    bio={bio || {}}
                    showBio={showBio}
                    onChange={onChange}
                />
            </div>
        );
    }

    // ── Display mode: read-only rendering ──
    // Build bio items — only include defined values and only if showBio is true
    const bioItems: { label: string; value: string }[] = [];
    if (showBio && bio) {
        if (bio.position) bioItems.push({ label: 'Pos', value: bio.position });
        if (bio.shoots_catches) bioItems.push({ label: 'Shoots/Catches', value: bio.shoots_catches });
        if (bio.height) bioItems.push({ label: 'Ht', value: bio.height });
        if (bio.weight) bioItems.push({ label: 'Wt', value: bio.weight });
        if (bio.birthYear) bioItems.push({ label: 'Born', value: String(bio.birthYear) });
    }

    const n = visibleStats.length;
    const valueFontSize =
        n <= 2 ? 'text-[48px] sm:text-[56px]' :
        n === 3 ? 'text-[38px] sm:text-[46px]' :
        n === 4 ? 'text-[30px] sm:text-[36px]' :
        n === 5 ? 'text-[24px] sm:text-[30px]' :
                  'text-[20px] sm:text-[24px]';

    return (
        <section className={`w-full px-4 py-4 lg:py-3 ${!onChange ? 'animate-fade-up opacity-0' : ''}`} style={!onChange ? { animationDelay: '700ms', animationFillMode: 'forwards' } : undefined}>
            {/* Section title = season */}
            {contextLabel && (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-3 text-center">{contextLabel}</p>
            )}

            {/* Performance stats — full width, equal columns */}
            <div className="flex w-full">
                {visibleStats.map((stat, index) => (
                    <React.Fragment key={stat.id || stat.label || index}>
                        <div className="flex-1 flex flex-col items-center">
                            <span className={`${valueFontSize} font-extrabold text-white tabular-nums leading-none tracking-tight`}>
                                {stat.value}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mt-1">
                                {stat.label}
                            </span>
                        </div>
                        {index < visibleStats.length - 1 && (
                            <div className="w-px self-stretch bg-white/[0.08]" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Bio details row */}
            {bioItems.length > 0 && (
                <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap mt-3">
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
            )}
        </section>
    );
}