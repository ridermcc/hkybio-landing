'use client';

import React from 'react';

interface Business {
    name: string;
    logoUrl?: string;
    coverUrl?: string;
    tagline?: string;
    url: string;
}

interface PlayerBusinessProps {
    businesses: Business[];
}

export function PlayerBusiness({ businesses }: PlayerBusinessProps) {
    if (!businesses || businesses.length === 0) return null;

    return (
        <section className="w-full py-4 animate-fade-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            {/* Section label */}
            <div className="flex items-center justify-center mb-3 px-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.12]" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] px-4">
                    Ventures
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.12]" />
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3 px-4">
                {businesses.map((biz, index) => (
                    <a
                        key={index}
                        href={biz.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.12] transition-all duration-200 block"
                    >
                        {/* Cover image */}
                        {biz.coverUrl && (
                            <div className="relative w-full aspect-[3/1]">
                                <img
                                    src={biz.coverUrl}
                                    alt={biz.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                {/* Logo overlapping the gradient fade */}
                                {biz.logoUrl && (
                                    <div className="absolute bottom-2.5 left-3">
                                        <img
                                            src={biz.logoUrl}
                                            alt={`${biz.name} logo`}
                                            className="h-8 w-auto object-contain drop-shadow-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content area */}
                        <div className="px-4 py-3.5 flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {/* Inline logo when no cover image */}
                                    {!biz.coverUrl && biz.logoUrl && (
                                        <img
                                            src={biz.logoUrl}
                                            alt={`${biz.name} logo`}
                                            className="h-6 w-6 rounded object-contain flex-shrink-0"
                                        />
                                    )}
                                    <h3 className="text-[15px] sm:text-[16px] font-extrabold text-white tracking-tight truncate">
                                        {biz.name}
                                    </h3>
                                </div>

                                {/* Arrow */}
                                <svg className="w-4 h-4 text-white/25 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>

                            {biz.tagline && (
                                <p className="text-[12px] sm:text-[13px] font-medium text-white/50 leading-snug">
                                    {biz.tagline}
                                </p>
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
