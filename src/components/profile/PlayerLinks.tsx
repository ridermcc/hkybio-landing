'use client';

import React from 'react';
import { getPlatformIcon } from '@/lib/constants';

interface PlayerLink {
    platform: string;
    url: string;
    logo_url?: string;
}

interface PlayerLinksProps {
    links: PlayerLink[];
    isEditing?: boolean;
    activeEditIndex?: number | null;
    onLinkClick?: (index: number) => void;
    onAddClick?: () => void;
}

export function PlayerLinks({
    links,
    isEditing = false,
    activeEditIndex = null,
    onLinkClick,
    onAddClick,
}: PlayerLinksProps) {
    if (!isEditing && (!links || links.length === 0)) return null;

    return (
        <div className="flex flex-wrap justify-center gap-1 pb-3 w-full px-3">
            {links?.map((link, index) => {
                const isActive = activeEditIndex === index;
                const iconPath = getPlatformIcon(link.platform);
                const innerContent = iconPath ? (
                    <img
                        src={iconPath}
                        alt={link.platform}
                        className="w-5 h-5 object-contain group-hover:opacity-100 group-hover:scale-110 transition-all duration-200"
                    />
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                    </svg>
                );

                const className = `group flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-lg border ${isActive
                    ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.2)] bg-white/[0.12]'
                    : 'border-white/5 hover:border-white/20 hover:bg-white/[0.1] hover:shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                    } overflow-hidden transition-all duration-200 ease-out hover:scale-[1.08] active:scale-[0.95] animate-fade-up text-white ${!isEditing ? 'opacity-0' : ''}`;

                if (isEditing) {
                    return (
                        <button
                            key={index}
                            onClick={() => onLinkClick?.(index)}
                            className={className}
                            type="button"
                            title={`Edit ${link.platform}`}
                        >
                            {innerContent}
                        </button>
                    );
                }

                return (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.platform}
                        className={className}
                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                    >
                        {innerContent}
                    </a>
                );
            })}

            {isEditing && links.length < 6 && (
                <button
                    onClick={onAddClick}
                    className={`group flex items-center justify-center shrink-0 w-10 h-10 rounded-full backdrop-blur-lg border border-dashed transition-all duration-200 ease-out hover:scale-[1.08] active:scale-[0.95] ${activeEditIndex === -1
                        ? 'border-white bg-white/10 text-white'
                        : 'border-white/[0.2] bg-white/[0.04] text-white/50 hover:text-white hover:border-white/[0.4] hover:bg-white/[0.08]'
                        }`}
                    type="button"
                    title="Add Link"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform duration-200">
                        <path d="M12 5v14m-7-7h14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
        </div>
    );
}
