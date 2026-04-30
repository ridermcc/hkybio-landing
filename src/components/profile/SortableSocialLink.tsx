'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getPlatformIcon } from '@/lib/constants';

interface PlayerLink {
    platform: string;
    url: string;
    logo_url?: string;
}

interface SortableSocialLinkProps {
    link: PlayerLink;
    index: number;
    onClick: () => void;
    isOverlay?: boolean;
}

export function SocialLinkIcon({ link, isDragging, isOverlay, ...props }: any) {
    const icon = getPlatformIcon(link.platform);
    
    return (
        <button
            {...props}
            type="button"
            className={`group flex items-center justify-center shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.04] backdrop-blur-lg border border-white/5 hover:border-white/20 hover:bg-white/[0.08] transition-all ${isOverlay ? 'scale-110 shadow-2xl ring-2 ring-white/20' : 'hover:scale-105'} ${isDragging && !isOverlay ? 'opacity-0' : 'opacity-100'} cursor-grab active:cursor-grabbing font-sans`}
            title={link.platform}
        >
            {icon ? (
                <img 
                    src={icon} 
                    alt={link.platform} 
                    className="w-4 h-4 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 pointer-events-none" 
                />
            ) : (
                <span className="text-[11px] font-bold text-white/90 group-hover:text-white pointer-events-none">
                    {link.platform?.charAt(0).toUpperCase()}
                </span>
            )}
        </button>
    );
}

export function SortableSocialLink({ link, index, onClick }: SortableSocialLinkProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.platform });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
        zIndex: isDragging ? 50 : 0,
    };

    return (
        <SocialLinkIcon
            ref={setNodeRef}
            style={style}
            link={link}
            isDragging={isDragging}
            onClick={onClick}
            {...attributes}
            {...listeners}
        />
    );
}
