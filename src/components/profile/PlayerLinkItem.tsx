'use client'

import React from 'react'
import { ImageUpload } from './ImageUpload'

export type LinkItemSize = 'compact' | 'standard'

export interface LinkItemData {
    name: string
    imageUrl: string
    linkUrl: string
    description: string
}

export interface LinkItemEditData {
    size?: LinkItemSize
    link: LinkItemData
}

interface PlayerLinkItemProps {
    size: LinkItemSize
    link: LinkItemData
    isEditing?: boolean
    onChange?: (data: LinkItemEditData) => void
}

export function PlayerLinkItem({ size, link, isEditing = false, onChange }: PlayerLinkItemProps) {
    const activeSize = size === 'compact' ? 'compact' : 'standard'
    const [activeTab, setActiveTab] = React.useState<'none' | 'layout' | 'image' | 'analytics'>('none')

    const update = (partial: Partial<LinkItemData>) => {
        onChange?.({
            link: {
                ...link,
                ...partial,
            },
        })
    }

    const updateSize = (newSize: LinkItemSize) => {
        onChange?.({ size: newSize, link })
    }

    if (isEditing) {
        return (
            <div className="w-full px-4 pb-4 pt-4 sm:px-5 sm:pb-5 flex flex-col">
                {/* Main Inputs Area - Stacked vertically */}
                <div className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Link Text</label>
                        <input
                            type="text"
                            value={link.name}
                            onChange={e => update({ name: e.target.value })}
                            placeholder="e.g. Brand / Team"
                            className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">URL</label>
                        <input
                            type="url"
                            value={link.linkUrl || ''}
                            onChange={e => update({ linkUrl: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                        />
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="w-full flex items-center gap-1 mt-4 border-t border-white/[0.06] pt-4">
                    <button
                        onClick={() => setActiveTab(activeTab === 'layout' ? 'none' : 'layout')}
                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${activeTab === 'layout' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'}`}
                        title="Layout"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setActiveTab(activeTab === 'image' ? 'none' : 'image')}
                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${activeTab === 'image' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'}`}
                        title="Image"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setActiveTab(activeTab === 'analytics' ? 'none' : 'analytics')}
                        className={`p-2 rounded-lg transition-colors flex items-center justify-center ${activeTab === 'analytics' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.06]'}`}
                        title="Analytics"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    </button>
                </div>

                {/* Tab Views */}
                {activeTab === 'layout' && (
                    <div className="w-full mt-4 flex flex-col gap-3 p-4 bg-black/40 border border-white/[0.06] rounded-xl animate-fade-in">
                        <label className="text-[12px] font-bold text-white/50">Choose a layout for your link</label>

                        {/* Classic (Compact) */}
                        <button
                            onClick={() => updateSize('compact')}
                            className={`w-full flex items-start p-4 rounded-xl border text-left transition-all ${activeSize === 'compact' ? 'border-white bg-white/[0.04]' : 'border-transparent bg-white/[0.02] hover:bg-white/[0.04]'}`}
                        >
                            <div className={`w-5 h-5 mt-0.5 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center ${activeSize === 'compact' ? 'border-white' : 'border-white/30'}`}>
                                {activeSize === 'compact' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                            </div>
                            <div className="flex-1 flex flex-col gap-1 w-full overflow-hidden">
                                <span className="font-bold text-white text-[15px]">Compact</span>
                                <span className="text-white/50 text-[13px] block mb-3">Clean and direct.</span>
                                {/* Mockup */}
                                <div className="w-full max-w-[240px] h-12 bg-[#1A1A1A] rounded-xl flex items-center px-1.5 border border-white/10 relative overflow-hidden">
                                    {link.imageUrl ? (
                                        <img src={link.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 bg-white/[0.05]" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                                                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                                                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                                            </svg>
                                        </div>
                                    )}
                                    {link.name ? (
                                        <span className="ml-3 text-[10px] sm:text-[11px] font-bold text-white truncate max-w-[120px]">{link.name}</span>
                                    ) : (
                                        <div className="h-1.5 w-1/2 bg-white rounded-full bg-white/20 ml-3" />
                                    )}
                                    <div className="absolute right-3 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Featured (Standard) */}
                        <button
                            onClick={() => updateSize('standard')}
                            className={`w-full flex items-start p-4 rounded-xl border text-left transition-all ${activeSize === 'standard' ? 'border-white bg-white/[0.04]' : 'border-transparent bg-white/[0.02] hover:bg-white/[0.04]'}`}
                        >
                            <div className={`w-5 h-5 mt-0.5 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center ${activeSize === 'standard' ? 'border-white' : 'border-white/30'}`}>
                                {activeSize === 'standard' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                            </div>
                            <div className="flex-1 flex flex-col gap-1 w-full overflow-hidden">
                                <span className="font-bold text-white text-[15px]">Showcase</span>
                                <span className="text-white/50 text-[13px] block mb-3">Maximum visibility.</span>
                                {/* Mockup */}
                                <div className="w-full max-w-[240px] bg-[#1A1A1A] rounded-2xl border border-white/10 overflow-hidden flex flex-col relative pb-3">
                                    {link.imageUrl ? (
                                        <img src={link.imageUrl} alt="" className="w-full h-32 object-cover bg-white/[0.02]" />
                                    ) : (
                                        <div className="w-full h-32 bg-white/[0.03] flex items-center justify-center border-b border-white/[0.04]">
                                            <svg className="w-6 h-6 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="px-3 pt-3 flex flex-col gap-1.5 w-[80%]">
                                        {link.name ? (
                                            <span className="text-[10px] sm:text-[11px] font-bold text-white truncate pr-4">{link.name}</span>
                                        ) : (
                                            <div className="h-1.5 w-3/4 bg-white rounded-full bg-white/20 mt-1" />
                                        )}
                                    </div>
                                    <div className="absolute bottom-3 right-3 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {activeTab === 'image' && (
                    <div className="w-full mt-4 p-4 bg-black/40 border border-white/[0.06] rounded-xl flex flex-col gap-3 animate-fade-in">
                        <label className="text-[12px] font-bold text-white/50 block">Link Image</label>
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08] group/upload">
                            {link.imageUrl ? (
                                <img
                                    src={link.imageUrl}
                                    alt={link.name || 'Link thumbnail'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-white/[0.02] flex items-center justify-center">
                                    <span className="text-white/20 text-sm font-semibold flex items-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                        Upload Image
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0">
                                <ImageUpload
                                    value={link.imageUrl}
                                    onChange={url => update({ imageUrl: url })}
                                    folder="links"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="w-full mt-4 p-6 bg-black/40 border border-white/[0.06] rounded-xl flex flex-col items-center justify-center gap-3 animate-fade-in text-center">

                        <span className="text-[14px] font-bold text-white">Analytics</span>
                        <p className="text-[13px] text-white/50 max-w-[200px]">Detailed click tracking and insights are coming soon.</p>
                    </div>
                )}
            </div>
        )
    }

    // View mode
    if (!link) return null

    if (activeSize === 'compact') {
        return (
            <section className="w-full py-1.5 lg:py-0 group/compact-link">
                <div className="flex flex-col gap-3 px-4">
                    <div className="relative group/link">
                        <a
                            href={link.linkUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-white/30 hover:bg-white/[0.1] p-2.5 transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.98] shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.08)]"
                        >
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.08]">
                                {link.imageUrl ? (
                                    <img src={link.imageUrl} alt={link.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <span className="flex-1 text-[13px] font-bold text-white tracking-tight truncate text-center">{link.name}</span>

                            <div className="w-10 flex justify-end items-center flex-shrink-0">
                                <svg
                                    className="w-4 h-4 text-white/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/50"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </a>
                    </div>
                </div>
            </section>
        )
    }

    // standard
    return (
        <section className="w-full py-1.5 lg:py-0">
            <div className="flex flex-col gap-3 px-4">
                <div className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl hover:border-white/30 transition-all duration-300 ease-out relative group/link shadow-[0_16px_56px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.1)] hover:scale-[1.03] active:scale-[0.98]">
                    <a href={link.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="block bg-white/[0.06] group hover:bg-white/[0.1] transition-colors">
                        <div className="w-full h-48 sm:h-56 bg-white/[0.03] flex items-center justify-center border-b border-white/[0.06] overflow-hidden relative">
                            {link.imageUrl ? (
                                <img src={link.imageUrl} alt={link.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            )}
                        </div>
                        <div className="p-4 sm:p-5 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white group-hover:text-white/80 transition-colors truncate pr-4">{link.name}</span>
                                <svg className="w-4 h-4 text-white/20 group-hover:text-white transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    )
}

