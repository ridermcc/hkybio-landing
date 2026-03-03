'use client';

import React, { useState } from 'react';

interface Sponsor {
    name: string;
    logoUrl: string;
    url?: string;
    description?: string;
    discount?: string;
    promoCode?: string;
}

interface PlayerSponsorsProps {
    sponsors: Sponsor[];
}

export function PlayerSponsors({ sponsors }: PlayerSponsorsProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    if (!sponsors || sponsors.length === 0) return null;

    const handleCopy = (e: React.MouseEvent, code: string, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

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
                        className="rounded-xl overflow-hidden border border-white/[0.06] transition-all duration-200 hover:border-white/[0.12]"
                    >
                        {/* Image — clickable to partner site */}
                        <a
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block w-full aspect-[3/1]"
                        >
                            <img
                                src={sponsor.logoUrl}
                                alt={sponsor.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Discount badge overlay */}
                            {sponsor.discount && (
                                <div className="absolute top-2.5 left-2.5 flex items-center px-2.5 py-2 rounded-full bg-black/60 backdrop-blur-sm">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wide leading-none">
                                        {sponsor.discount}
                                    </span>
                                </div>
                            )}
                        </a>

                        {/* Promo code bar — below image, always visible */}
                        {sponsor.promoCode && (
                            <button
                                onClick={(e) => handleCopy(e, sponsor.promoCode!, index)}
                                className="flex items-center justify-center gap-2 w-full py-3 hover:bg-white/[0.1] transition-all cursor-pointer border-t border-white/[0.04]"
                            >
                                <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {copiedIndex === index ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    )}
                                </svg>
                                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/60">
                                    {copiedIndex === index ? 'Copied!' : `Use code ${sponsor.promoCode}`}
                                </span>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
