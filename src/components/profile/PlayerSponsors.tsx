'use client';

import React from 'react';

interface Sponsor {
    name: string;
    logoUrl: string;
    url?: string;
    description?: string;
}

interface PlayerSponsorsProps {
    sponsors: Sponsor[];
}

export function PlayerSponsors({ sponsors }: PlayerSponsorsProps) {
    if (!sponsors || sponsors.length === 0) return null;

    return (
        <section className="w-full py-4 animate-fade-up opacity-0" style={{ animationDelay: '550ms', animationFillMode: 'forwards' }}>
            {/* Section label */}
            <div className="flex items-center justify-center mb-3 px-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.12]" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] px-4">
                    Partners
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.12]" />
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3 px-4">
                {sponsors.map((sponsor, index) => (
                    <div
                        key={index}
                        className="rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.12] transition-all duration-200"
                    >
                        <a
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                        >
                            <div className="relative w-full aspect-[3/1]">
                                <img
                                    src={sponsor.logoUrl}
                                    alt={sponsor.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            </div>

                            <div className="px-4 py-3.5 flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <h3 className="text-[15px] sm:text-[16px] font-extrabold text-white tracking-tight truncate">
                                            {sponsor.name}
                                        </h3>
                                    </div>

                                    <svg className="w-4 h-4 text-white/25 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>

                                {sponsor.description && (
                                    <p className="text-[12px] sm:text-[13px] font-medium text-white/50 leading-snug">
                                        {sponsor.description}
                                    </p>
                                )}
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}
