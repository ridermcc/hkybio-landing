'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable'

import { AdminSectionWrapper } from '@/components/admin/AdminSectionWrapper'
import { FloatingActionBar } from '@/components/admin/FloatingActionBar'
import { AddComponentPanel, LinkItemFormData, ComponentFormData, StatsFormData, VideoFormData, ArticlesFormData, ScheduleFormData } from '@/components/admin/AddComponentPanel'
import { PreviewPanel } from '@/components/admin/PreviewPanel'
import { AdminHeader } from '@/components/admin/AdminHeader'

// Profile components
import { PlayerHero, HeroEditData } from '@/components/profile/PlayerHero'
import { PlayerStats, StatsEditData } from '@/components/profile/PlayerStats'
import { PlayerSchedule, ScheduleEditData } from '@/components/profile/PlayerSchedule'
import { PlayerVideo, VideoEditData } from '@/components/profile/PlayerVideo'
import { PlayerJourney, JourneyEditData } from '@/components/profile/PlayerJourney'
import { PlayerLinkItem, LinkItemEditData, LinkItemData, LinkItemSize } from '@/components/profile/PlayerLinkItem'
import { PlayerArticles, ArticlesEditData } from '@/components/profile/PlayerArticles'
import { ProfileFooter, FooterEditData } from '@/components/profile/ProfileFooter'

export type SectionType =
    | 'stats'
    | 'schedule'
    | 'video'
    | 'journey'
    | 'link'
    | 'articles'

const UNIQUE_SECTIONS: SectionType[] = ['stats', 'schedule', 'video', 'journey', 'articles']

const SECTION_LABELS: Record<string, string> = {
    hero: 'Hero',
    stats: 'Stats',
    schedule: 'Schedule',
    video: 'Video',
    journey: 'Career',
    articles: 'Articles',
}

function getSectionLabel(sectionId: string, data?: ProfileData): string {
    if (SECTION_LABELS[sectionId]) return SECTION_LABELS[sectionId]
    if (isLinkSection(sectionId)) return 'Link'
    return sectionId
}

function isLinkSection(sectionId: string): boolean {
    return sectionId.startsWith('linkitem-')
}

function getStableKey(sectionId: string): string {
    if (sectionId.startsWith('linkitem-')) {
        // ID format: linkitem-<size>-<timestamp>
        // We use the timestamp part as the stable key to prevent remounting when size changes.
        const parts = sectionId.split('-');
        if (parts.length >= 3) {
            return `linkitem-stable-${parts.slice(2).join('-')}`;
        }
    }
    return sectionId;
}

export interface LinkItemSectionData {
    id: string
    size: LinkItemSize
    link: LinkItemData
}

export interface ProfileData {
    playerId: string
    hero: HeroEditData
    stats: StatsEditData
    schedule: ScheduleEditData & { games?: any[] }
    video: VideoEditData
    journey: {
        stops: Array<{
            id?: string
            teamName: string
            league: string
            startYear: number
            endYear?: number
            accolades: string[]
        }>
    }
    linkItems: LinkItemSectionData[]
    articles: ArticlesEditData
    footer: FooterEditData
    sections: string[]
    disabledSections: string[]
}

interface ProfileEditorClientProps {
    initialData: ProfileData
}

function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args)
        }, delay)
    }, [callback, delay])
}

export function ProfileEditorClient({ initialData }: ProfileEditorClientProps) {
    const [data, setData] = useState<ProfileData>(initialData)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [pendingScrollToSectionId, setPendingScrollToSectionId] = useState<string | null>(null)
    const [isAddPanelOpen, setIsAddPanelOpen] = useState(false)
    const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [newlyAdded, setNewlyAdded] = useState<Set<string>>(new Set())

    useEffect(() => {
        setMounted(true)
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
        useSensor(KeyboardSensor)
    )

    const performSave = useCallback(async (currentData: ProfileData) => {
        setSaveStatus('saving')
        try {
            const sponsorsList = currentData.sections.flatMap(sectionId => {
                if (!isLinkSection(sectionId)) return []
                const item = currentData.linkItems.find(b => b.id === sectionId)
                if (!item) return []
                return [{
                    name: item.link.name,
                    imageUrl: item.link.imageUrl,
                    linkUrl: item.link.linkUrl,
                    description: item.link.description,
                }]
            })

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: currentData.playerId,
                    sections: currentData.sections,
                    hero: currentData.hero,
                    stats: currentData.stats,
                    schedule: currentData.schedule,
                    video: currentData.video,
                    journey: currentData.journey,
                    sponsors: { sponsors: sponsorsList },
                    articles: currentData.articles,
                    footer: currentData.footer,
                    disabled_sections: currentData.disabledSections,
                }),
            })

            if (res.ok) {
                setSaveStatus('saved')
                setTimeout(() => setSaveStatus('idle'), 2000)
            } else {
                const result = await res.json()
                console.error('Save failed:', result.error)
                setSaveStatus('error')
            }
        } catch (err) {
            console.error('Save failed:', err)
            setSaveStatus('error')
        }
    }, [])

    const debouncedSave = useDebouncedCallback((currentData: ProfileData) => {
        performSave(currentData)
    }, 1500)

    const updateSection = useCallback(<K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
        setData(prev => {
            const newData = { ...prev, [key]: value }
            debouncedSave(newData)
            return newData
        })
        setSaveStatus('idle')
    }, [debouncedSave])

    const updateLinkItem = useCallback((itemId: string, linkData: LinkItemEditData) => {
        setData(prev => {
            const oldItem = prev.linkItems.find(i => i.id === itemId);
            if (!oldItem) return prev;

            const newSize = linkData.size || oldItem.size;
            let newId = itemId;

            if (newSize !== oldItem.size) {
                // If it follows the linkitem-<size>-<timestamp> format, update the size part
                const parts = itemId.split('-');
                if (parts.length >= 3 && parts[0] === 'linkitem') {
                    newId = `linkitem-${newSize}-${parts.slice(2).join('-')}`;
                } else {
                    // Fallback for legacy IDs or irregular formats
                    newId = `linkitem-${newSize}-${Date.now()}`;
                }
            }

            const newData = {
                ...prev,
                sections: prev.sections.map(s => s === itemId ? newId : s),
                linkItems: prev.linkItems.map(item =>
                    item.id === itemId
                        ? {
                            ...item,
                            id: newId,
                            size: newSize,
                            link: { ...item.link, ...linkData.link }
                        }
                        : item
                )
            }
            debouncedSave(newData)
            return newData
        })
        setSaveStatus('idle')
    }, [debouncedSave])

    const removeSection = useCallback((sectionId: string) => {
        setData(prev => {
            const isLink = isLinkSection(sectionId)
            let newLinkItems = prev.linkItems
            if (isLink) {
                newLinkItems = prev.linkItems.filter(b => b.id !== sectionId)
            }
            const newData = {
                ...prev,
                sections: prev.sections.filter(s => s !== sectionId),
                disabledSections: prev.disabledSections.filter(s => s !== sectionId),
                linkItems: newLinkItems,
            }
            debouncedSave(newData)
            return newData
        })
        setSaveStatus('idle')
    }, [debouncedSave])

    const toggleSectionVisibility = useCallback((sectionId: string) => {
        setData(prev => {
            const isHidden = prev.disabledSections.includes(sectionId)
            const newDisabled = isHidden
                ? prev.disabledSections.filter(id => id !== sectionId)
                : [...prev.disabledSections, sectionId]

            const newData = {
                ...prev,
                disabledSections: newDisabled
            }
            debouncedSave(newData)
            return newData
        })
        setSaveStatus('idle')
    }, [debouncedSave])

    const addSection = useCallback((type: SectionType, initialData?: ComponentFormData) => {
        const id = type === 'link'
            ? `linkitem-compact-${Date.now()}`
            : type === 'stats'
                ? 'stats'
                : type === 'video'
                    ? 'video'
                    : type === 'articles'
                        ? 'articles'
                        : type === 'schedule'
                            ? 'schedule'
                            : type === 'journey'
                                ? 'journey'
                                : `section-${Date.now()}`

        setData(prev => {
            const isUnique = UNIQUE_SECTIONS.includes(type)
            if (isUnique && prev.sections.includes(type)) return prev

            const nextSections = [...prev.sections, id]
            let nextLinkItems = prev.linkItems
            let nextStats = prev.stats
            let nextVideo = prev.video
            let nextArticles = prev.articles
            let nextSchedule = prev.schedule

            if (type === 'link') {
                nextLinkItems = [...prev.linkItems, {
                    id,
                    size: 'compact',
                    link: {
                        name: '',
                        imageUrl: '',
                        linkUrl: '',
                        description: '',
                    },
                }]
            } else if (type === 'stats') {
                const statsData = initialData as StatsFormData | undefined
                nextStats = {
                    ...prev.stats,
                    season: statsData?.season || prev.stats.season,
                    bio: {
                        position: statsData?.position || prev.stats.bio?.position,
                        shoots_catches: statsData?.shootsCatches || prev.stats.bio?.shoots_catches,
                        height: statsData?.height || prev.stats.bio?.height,
                        weight: statsData?.weight || prev.stats.bio?.weight,
                        birthYear: statsData?.birthYear ? parseInt(statsData.birthYear) : prev.stats.bio?.birthYear,
                    },
                    showBio: false
                }
            } else if (type === 'video') {
                const videoData = initialData as VideoFormData | undefined
                nextVideo = {
                    ...prev.video,
                    url: videoData?.url || '',
                    title: videoData?.title || '',
                }
            } else if (type === 'articles') {
                const articlesData = initialData as ArticlesFormData | undefined
                nextArticles = {
                    ...prev.articles,
                    urls: articlesData?.url ? [...prev.articles.urls, articlesData.url] : prev.articles.urls,
                    sectionTitle: prev.articles.sectionTitle || ''
                }
            } else if (type === 'schedule') {
                const scheduleData = initialData as ScheduleFormData | undefined
                nextSchedule = {
                    ...prev.schedule,
                    scheduleUrl: scheduleData?.scheduleUrl || prev.schedule.scheduleUrl,
                }
            }

            const newData = {
                ...prev,
                sections: nextSections,
                linkItems: nextLinkItems,
                stats: nextStats,
                video: nextVideo,
                articles: nextArticles,
                schedule: nextSchedule,
            }
            debouncedSave(newData)
            return newData
        })
        setNewlyAdded(prev => new Set(prev).add(id))
        setPendingScrollToSectionId(id)
        setSaveStatus('idle')
    }, [debouncedSave])

    useEffect(() => {
        if (!pendingScrollToSectionId) return
        const el = document.getElementById(`section-${pendingScrollToSectionId}`)
        if (!el) return
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setPendingScrollToSectionId(null)
    }, [pendingScrollToSectionId])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        setData(prev => {
            const oldIndex = prev.sections.indexOf(String(active.id))
            const newIndex = prev.sections.indexOf(String(over.id))
            if (oldIndex === -1 || newIndex === -1) return prev
            const newData = { ...prev, sections: arrayMove(prev.sections, oldIndex, newIndex) }
            debouncedSave(newData)
            return newData
        })
        setSaveStatus('idle')
    }, [debouncedSave])

    // All components always render in edit mode on dashboard
    const renderSection = (sectionId: string) => {
        const isLink = isLinkSection(sectionId)
        if (isLink) {
            const item = data.linkItems.find(b => b.id === sectionId)
            if (!item) return null
            return <PlayerLinkItem size={item.size} link={item.link} isEditing={true} onChange={linkData => updateLinkItem(sectionId, linkData)} />
        }
        switch (sectionId) {
            case 'stats':
                return <PlayerStats stats={data.stats.stats} season={data.stats.season} bio={data.stats.bio} showBio={data.stats.showBio} isEditing={true} onChange={v => updateSection('stats', v)} />
            case 'schedule':
                return <PlayerSchedule playerId={data.playerId} scheduleUrl={data.schedule.scheduleUrl} games={data.schedule.games || []} isEditing={true} onChange={v => updateSection('schedule', v)} />
            case 'video':
                return <PlayerVideo url={data.video.url} title={data.video.title} isEditing={true} onChange={v => updateSection('video', v)} />
            case 'journey':
                return <PlayerJourney stops={data.journey.stops.map(s => ({ ...s, years: s.endYear ? `${s.startYear}-${s.endYear}` : `${s.startYear}-Present`, seasons: s.endYear ? s.endYear - s.startYear : new Date().getFullYear() - s.startYear }))} isEditing={true} onChange={journeyData => updateSection('journey', { stops: journeyData.stops.map(s => ({ id: s.id, teamName: s.teamName, league: s.league, startYear: s.startYear || 0, endYear: s.endYear, accolades: s.accolades || [] })) })} />
            case 'articles':
                return <PlayerArticles urls={data.articles.urls.filter(u => u.trim())} sectionTitle={data.articles.sectionTitle} isEditing={true} onChange={v => updateSection('articles', v)} />
            default:
                return null
        }
    }

    const renderPreviewContent = () => (
        <div className="flex flex-col">
            <PlayerHero playerName={data.hero.playerName} username={data.hero.username} imageUrl={data.hero.imageUrl} originalImageUrl={data.hero.originalImageUrl} nationality={data.hero.nationality} teamName={data.hero.teamName} leagueName={data.hero.leagueName} bio={data.hero.bio} socialLinks={data.hero.socialLinks} isEditing={false} onChange={() => { }} />
            {data.sections.map(sectionId => {
                if (data.disabledSections.includes(sectionId)) return null
                const isLink = isLinkSection(sectionId)
                if (isLink) {
                    const item = data.linkItems.find(b => b.id === sectionId)
                    if (!item) return null
                    return <PlayerLinkItem key={sectionId} size={item.size} link={item.link} isEditing={false} onChange={() => { }} />
                }
                switch (sectionId) {
                    case 'stats': return <PlayerStats key={sectionId} stats={data.stats.stats} season={data.stats.season} bio={data.stats.bio} showBio={data.stats.showBio} isEditing={false} onChange={() => { }} />
                    case 'schedule': return <PlayerSchedule key={sectionId} playerId={data.playerId} scheduleUrl={data.schedule.scheduleUrl} games={data.schedule.games || []} isEditing={false} onChange={() => { }} />
                    case 'video': return <PlayerVideo key={sectionId} url={data.video.url} title={data.video.title} isEditing={false} onChange={() => { }} />
                    case 'journey': return <PlayerJourney key={sectionId} stops={data.journey.stops.map(s => ({ ...s, years: s.endYear ? `${s.startYear}-${s.endYear}` : `${s.startYear}-Present`, seasons: s.endYear ? s.endYear - s.startYear : new Date().getFullYear() - s.startYear }))} isEditing={false} onChange={() => { }} />
                    case 'articles': return <PlayerArticles key={sectionId} urls={data.articles.urls.filter(u => u.trim())} sectionTitle={data.articles.sectionTitle} isEditing={false} onChange={() => { }} />
                    default: return null
                }
            })}
            <ProfileFooter mode={data.footer.mode} playerName={data.footer.playerName} teamName={data.footer.teamName} leagueName={data.footer.leagueName} agentName={data.footer.agentName} agencyName={data.footer.agencyName} isEditing={false} onChange={() => { }} />
        </div>
    )

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="min-h-screen bg-hky-black text-white flex flex-col">
                <AdminHeader username={data.hero.username} avatarUrl={data.hero.imageUrl} />



                <div className="w-full max-w-3xl mx-auto flex-1 pb-32 pt-6">
                    {/* Hero - always in edit mode */}
                    <AdminSectionWrapper id="hero" label="Hero" isHero={true} onRemove={() => { }}>
                        <PlayerHero playerName={data.hero.playerName} username={data.hero.username} imageUrl={data.hero.imageUrl} originalImageUrl={data.hero.originalImageUrl} nationality={data.hero.nationality} teamName={data.hero.teamName} leagueName={data.hero.leagueName} bio={data.hero.bio} socialLinks={data.hero.socialLinks} isEditing={true} onChange={v => updateSection('hero', v)} />
                    </AdminSectionWrapper>

                    {/* Divider between Hero and Links */}
                    <div className="w-full mt-4 mb-7 border-t border-white/[0.06]" />

                    {/* Sortable sections - all in edit mode (client-only to prevent hydration mismatch) */}
                    {mounted && (
                        <SortableContext items={data.sections} strategy={verticalListSortingStrategy}>
                            {data.sections.map(sectionId => (
                                <div key={getStableKey(sectionId)} id={`section-${sectionId}`}>
                                    <AdminSectionWrapper
                                        id={sectionId}
                                        label={getSectionLabel(sectionId, data)}
                                        defaultExpanded={newlyAdded.has(sectionId)}
                                        onRemove={() => removeSection(sectionId)}
                                        isVisible={!data.disabledSections.includes(sectionId)}
                                        onToggleVisibility={() => toggleSectionVisibility(sectionId)}
                                    >
                                        {renderSection(sectionId)}
                                    </AdminSectionWrapper>
                                </div>
                            ))}
                        </SortableContext>
                    )}

                    {/* add component button */}
                    <div className="px-3">
                        <div className="w-full overflow-hidden z-10 border-1 border-dashed border-white/30 rounded-2xl bg-hky-black">
                            <button
                                onClick={() => setIsAddPanelOpen(true)}
                                className="w-full p-4 text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-colors flex items-center justify-center"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Divider between Links and Footer */}
                    <div className="w-full mt-7 mb-7 border-t border-white/[0.06]" />

                    {/* Footer - always in edit mode */}
                    <div className="w-full mt-4">
                        <ProfileFooter mode={data.footer.mode} playerName={data.footer.playerName} teamName={data.footer.teamName} leagueName={data.footer.leagueName} agentName={data.footer.agentName} agencyName={data.footer.agencyName} isEditing={true} onChange={v => updateSection('footer', v)} />
                    </div>
                </div>

                <FloatingActionBar onAddClick={() => setIsAddPanelOpen(true)} onPreviewClick={() => setIsPreviewPanelOpen(true)} />

                <AddComponentPanel isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} activeSections={data.sections} onAdd={addSection} />

                <PreviewPanel isOpen={isPreviewPanelOpen} onClose={() => setIsPreviewPanelOpen(false)} username={data.hero.username}>
                    {renderPreviewContent()}
                </PreviewPanel>
            </div>
        </DndContext>
    )
}
