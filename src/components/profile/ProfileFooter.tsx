'use client'

import React, { useState } from 'react'
import { EditFooterPanel } from './EditFooterPanel'

export type FooterMode = 'player' | 'represented'

export interface FooterEditData {
    mode: FooterMode
    playerName: string
    teamName: string
    leagueName: string
    agentName: string
    agencyName: string
}

interface ProfileFooterProps {
    mode?: FooterMode
    playerName?: string
    teamName?: string
    leagueName?: string
    agentName?: string
    agencyName?: string
    isEditing?: boolean
    onChange?: (data: FooterEditData) => void
}

export function ProfileFooter({
    mode = 'player',
    playerName,
    teamName,
    leagueName,
    agentName,
    agencyName,
    isEditing = false,
    onChange,
}: ProfileFooterProps) {
    const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)

    const currentData: FooterEditData = {
        mode,
        playerName: playerName || '',
        teamName: teamName || '',
        leagueName: leagueName || '',
        agentName: agentName || '',
        agencyName: agencyName || '',
    }

    const update = (partial: Partial<FooterEditData>) => {
        onChange?.({ ...currentData, ...partial })
    }

    if (isEditing) {
        return (
            <div className="flex flex-col gap-4">

                <div
                    onClick={() => setIsEditPanelOpen(true)}
                    className="flex flex-col items-center text-center p-4 bg-white/[0.02] border-t border-b border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer group/footer relative"
                >
                    {/* Section Title */}
                    <div className="flex items-center gap-2.5 px-3 mb-2">
                        <span className="text-[14px] font-bold text-white/90">Footer</span>
                        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-white/[0.04] text-white/40">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] opacity-0 group-hover/footer:opacity-100 transition-opacity">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/60">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                    </div>

                    <div className="space-y-1">
                        {mode === 'player' ? (
                            <>
                                <p className="text-[15px] font-bold text-white/80 group-hover/footer:text-white transition-colors">
                                    {playerName || 'Add player name'}
                                </p>
                                {(teamName || leagueName) && (
                                    <p className="text-[13px] font-medium text-white/30 group-hover/footer:text-white/40 transition-colors">
                                        {[teamName, leagueName].filter(Boolean).join(' · ')}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/20 mb-1.5 group-hover/footer:text-white/30 transition-colors">
                                    Represented by
                                </p>
                                <p className="text-[15px] font-bold text-white/80 group-hover/footer:text-white transition-colors">
                                    {agentName || 'Add agent name'}
                                </p>
                                {agencyName && (
                                    <p className="text-[13px] font-medium text-white/30 group-hover/footer:text-white/40 transition-colors">
                                        {agencyName}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <EditFooterPanel
                    isOpen={isEditPanelOpen}
                    onClose={() => setIsEditPanelOpen(false)}
                    data={currentData}
                    onSave={update}
                />
            </div>
        )
    }

    return (
        <footer className="w-full mt-auto pt-6 pb-6 px-4 text-center">
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent mb-6" />

            <div className="mb-5">
                {mode === 'player' ? (
                    <>
                        {playerName && (
                            <p className="text-[13px] font-medium text-white/60">{playerName}</p>
                        )}
                        {(teamName || leagueName) && (
                            <p className="text-[11px] text-white/25 mt-0.5">
                                {[teamName, leagueName].filter(Boolean).join(' · ')}
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20 mb-1.5">
                            Represented by
                        </p>
                        {agentName && (
                            <p className="text-[13px] font-medium text-white/60">{agentName}</p>
                        )}
                        {agencyName && (
                            <p className="text-[11px] text-white/25 mt-0.5">{agencyName}</p>
                        )}
                    </>
                )}
            </div>

            <p className="text-[9px] text-white/10 mt-2">
                © {new Date().getFullYear()} hky.bio. All rights reserved.
            </p>
        </footer>
    )
}

