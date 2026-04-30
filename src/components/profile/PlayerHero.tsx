'use client'

import React, { useState } from 'react';
import { PlayerLinks } from './PlayerLinks';
import { InlineEdit } from './InlineEdit';
import { ImageUpload } from './ImageUpload';
import { AddSocialPanel } from './AddSocialPanel';
import { EditHeroPanel } from './EditHeroPanel';
import { SOCIAL_PLATFORMS, getPlatformIcon } from '@/lib/constants';
import { PhotoEditorPanel } from './PhotoEditorPanel';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { SortableSocialLink, SocialLinkIcon } from './SortableSocialLink';
import { DragOverlay } from '@dnd-kit/core';

interface PlayerLink {
    platform: string;
    url: string;
    logo_url?: string;
}

export interface HeroEditData {
    playerName: string;
    username: string;
    imageUrl: string;
    nationality: string;
    teamName: string;
    leagueName: string;
    bio: string;
    socialLinks: PlayerLink[];
    originalImageUrl?: string;
}

interface PlayerHeroProps {
    playerName?: string;
    username: string;
    imageUrl?: string;
    nationality?: string;
    teamName?: string;
    leagueName?: string;
    bio?: string;
    socialLinks?: PlayerLink[];
    originalImageUrl?: string;
    isEditing?: boolean;
    onChange?: (data: HeroEditData) => void;
}

export function PlayerHero({
    playerName,
    username,
    imageUrl,
    nationality,
    teamName,
    leagueName,
    bio,
    socialLinks,
    originalImageUrl,
    isEditing = false,
    onChange,
}: PlayerHeroProps) {
    const [isSocialPanelOpen, setIsSocialPanelOpen] = useState(false);
    const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
    const [isPhotoPanelOpen, setIsPhotoPanelOpen] = useState(false);
    const [editPlatform, setEditPlatform] = useState<string | null>(null);
    const [mounted, setMounted] = React.useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = (socialLinks || []).findIndex(l => l.platform === active.id);
            const newIndex = (socialLinks || []).findIndex(l => l.platform === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newLinks = arrayMove(socialLinks || [], oldIndex, newIndex);
                update('socialLinks', newLinks);
            }
        }
    };

    const update = (field: keyof HeroEditData, value: any) => {
        if (!onChange) return;
        onChange({
            playerName: playerName || '',
            username,
            imageUrl: imageUrl || '',
            nationality: nationality || '',
            teamName: teamName || '',
            leagueName: leagueName || '',
            bio: bio || '',
            socialLinks: socialLinks || [],
            originalImageUrl: originalImageUrl || '',
            [field]: value,
        });
    };


    const addLink = () => {
        if (!onChange) return;
        update('socialLinks', [...(socialLinks || []), { platform: '', url: '' }]);
    };

    const removeLink = (index: number) => {
        if (!onChange) return;
        update('socialLinks', (socialLinks || []).filter((_, i) => i !== index));
    };

    if (isEditing) {
        return (
            <div className="flex flex-col gap-6">
                {/* Top Section: Photo and Basic Info */}
                <div className="flex flex-row items-center gap-5 lg:gap-6">
                    {/* Photo Upload Thumbnail */}
                    <div className="flex-shrink-0">
                        <div
                            className="w-24 h-26 sm:w-28 sm:h-30 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08] relative group/upload shadow-sm shrink-0 cursor-pointer"
                            onClick={() => setIsPhotoPanelOpen(true)}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={playerName || 'Player photo'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 mb-1">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity duration-200">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">edit photo</span>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info Display (Clickable to Edit) */}
                    <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                        <div
                            onClick={() => setIsEditPanelOpen(true)}
                            className="flex flex-col gap-0.5 cursor-pointer group/hero"
                        >
                            <div className="flex items-center gap-2 group/name">
                                <h1 className="text-[22px] font-extrabold text-white tracking-tight truncate">
                                    {playerName}
                                </h1>
                                <div className="flex items-center justify-center ml-2 w-5 h-5 rounded-md bg-white/[0.04] text-white/40">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={!teamName ? "text-[15px] font-medium text-white/20" : "text-[15px] font-medium text-white/40 group-hover/hero:text-white/60 transition-colors"}>
                                    {teamName || 'Add team'}
                                </span>
                                {leagueName && (
                                    <>
                                        <span className="text-white/10 text-[10px]">|</span>
                                        <span className="text-[13px] font-medium text-white/20 truncate">{leagueName}</span>
                                    </>
                                )}
                            </div>
                            {bio && (
                                <p className="text-[13px] text-white/40 mt-1 line-clamp-2 max-w-sm">
                                    {bio}
                                </p>
                            )}
                        </div>

                        {/* Social Links List - Now below team/league */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                            {mounted && (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onDragCancel={() => setActiveId(null)}
                                >
                                    <SortableContext
                                        items={(socialLinks || []).map(l => l.platform)}
                                        strategy={rectSortingStrategy}
                                    >
                                        {socialLinks?.map((link, index) => {
                                            if (!link.platform || !link.url) return null;
                                            return (
                                                <SortableSocialLink
                                                    key={link.platform}
                                                    link={link}
                                                    index={index}
                                                    onClick={() => {
                                                        setEditPlatform(link.platform);
                                                        setIsSocialPanelOpen(true);
                                                    }}
                                                />
                                            );
                                        })}
                                    </SortableContext>
                                    <DragOverlay adjustScale={true}>
                                        {activeId ? (
                                            <SocialLinkIcon
                                                link={(socialLinks || []).find(l => l.platform === activeId)}
                                                isOverlay={true}
                                            />
                                        ) : null}
                                    </DragOverlay>
                                </DndContext>
                            )}

                            {(socialLinks || []).length < 6 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditPlatform(null);
                                        setIsSocialPanelOpen(true);
                                    }}
                                    className="group flex items-center justify-center shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full backdrop-blur-lg border border-dashed border-white/[0.2] bg-white/[0.04] text-white/40 hover:text-white hover:border-white/[0.4] hover:bg-white/[0.08] hover:scale-105"
                                    title="Add Social Link"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform duration-200">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <EditHeroPanel
                    isOpen={isEditPanelOpen}
                    onClose={() => setIsEditPanelOpen(false)}
                    data={{
                        playerName: playerName || '',
                        nationality: nationality || '',
                        teamName: teamName || '',
                        leagueName: leagueName || '',
                        bio: bio || '',
                    }}
                    onSave={(field, value) => update(field as keyof HeroEditData, value)}
                />

                <AddSocialPanel
                    isOpen={isSocialPanelOpen}
                    onClose={() => setIsSocialPanelOpen(false)}
                    existingLinks={socialLinks || []}
                    initialPlatform={editPlatform}
                    onSave={(platform, url) => {
                        const existingIndex = (socialLinks || []).findIndex(l => l.platform.toLowerCase() === platform.toLowerCase());
                        if (existingIndex >= 0) {
                            const links = [...(socialLinks || [])];
                            links[existingIndex] = { platform, url };
                            update('socialLinks', links);
                        } else {
                            if ((socialLinks || []).length < 6) {
                                if (onChange) update('socialLinks', [...(socialLinks || []), { platform, url }]);
                            }
                        }
                    }}
                    onRemove={(platform) => {
                        const idx = (socialLinks || []).findIndex(l => l.platform.toLowerCase() === platform.toLowerCase());
                        if (idx >= 0) removeLink(idx);
                    }}
                />

                <PhotoEditorPanel
                    isOpen={isPhotoPanelOpen}
                    onClose={() => setIsPhotoPanelOpen(false)}
                    imageUrl={imageUrl || ''}
                    originalImageUrl={originalImageUrl || imageUrl}
                    playerName={playerName || ''}
                    onSave={(url, originalUrl) => {
                        if (!onChange) return;
                        onChange({
                            playerName: playerName || '',
                            username,
                            imageUrl: url,
                            originalImageUrl: originalUrl,
                            nationality: nationality || '',
                            teamName: teamName || '',
                            leagueName: leagueName || '',
                            bio: bio || '',
                            socialLinks: socialLinks || [],
                        });
                    }}
                />
            </div>
        );
    }

    return (
        <section className="w-full">
            {/* Full-bleed hero image */}
            <div className="relative w-full aspect-[4/3] max-h-[400px] sm:max-h-[440px] lg:max-h-[480px] overflow-hidden">
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={playerName}
                        className="w-full h-full object-cover"
                    />
                )}
                {!imageUrl && (
                    <div className="w-full h-full bg-white/[0.02]" />
                )}
                {/* Gradient fade — tall enough to cover bottom half, blends to page bg */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" style={{ top: '40%' }} />
            </div>

            {/* Identity + links — overlapping the gradient, centered */}
            <div className="relative -mt-16 sm:-mt-20 flex flex-col items-center text-center px-4">
                {teamName || leagueName ? (
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
                            {[teamName, leagueName].filter(Boolean).join(' • ')}
                        </span>
                    </div>
                ) : null}

                <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-[900] tracking-tight text-white leading-[1.1] drop-shadow-2xl">
                    {playerName}
                </h1>

                {bio && (
                    <div className="mt-1 max-w-[320px] sm:max-w-[480px]">
                        <p className="text-[15px] sm:text-[17px] text-white/80 leading-relaxed font-medium">
                            {bio}
                        </p>
                    </div>
                )}
                {/* Social Links — same style as before */}
                <div className="mt-3 w-full max-w-sm flex flex-col items-center">
                    <PlayerLinks
                        links={socialLinks || []}
                        isEditing={false}
                    />
                </div>

            </div>
        </section>
    );
}