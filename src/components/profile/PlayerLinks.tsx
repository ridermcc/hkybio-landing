'use client';

import React from 'react';

interface PlayerLink {
    platform: string;
    url: string;
    logo_url?: string;
}

interface PlayerLinksProps {
    links: PlayerLink[];
}

export function PlayerLinks({ links }: PlayerLinksProps) {
    if (!links || links.length === 0) return null;

    return (
        <div className="flex flex-nowrap justify-center gap-2 pt-2 pb-3 w-full px-3">
            {links.map((link, index) => (
                <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.platform}
                    className="group flex items-center justify-center shrink-0 w-14 h-9 rounded-xl bg-white/[0.06] backdrop-blur-lg border border-white/[0.08] overflow-hidden transition-all duration-200 ease-out hover:bg-white/[0.1] hover:border-ice-500/40 hover:shadow-[0_0_12px_rgba(2,132,199,0.15)] hover:scale-105 active:scale-[0.97] animate-fade-up opacity-0"
                    style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'forwards' }}
                >
                    {link.logo_url ? (
                        <img
                            src={link.logo_url}
                            alt={link.platform}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-[13px] font-bold text-ice-300">
                            {link.platform.charAt(0).toUpperCase()}
                        </span>
                    )}
                </a>
            ))}
        </div>
    );
}
