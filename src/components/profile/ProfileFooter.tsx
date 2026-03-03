import React from 'react'

interface ProfileFooterProps {
    agentName?: string
    agencyName?: string
}

export function ProfileFooter({ agentName, agencyName }: ProfileFooterProps) {
    const hasRepresentation = agentName && agencyName

    return (
        <footer className="w-full mt-auto pt-8 pb-6 px-4 text-center">
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent mb-6" />

            {hasRepresentation && (
                <div className="mb-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20 mb-1.5">
                        Represented by
                    </p>
                    <p className="text-[13px] font-medium text-white/60">{agentName}</p>
                    <p className="text-[11px] text-white/25 mt-0.5">{agencyName}</p>
                </div>
            )}

            <p className="text-[9px] text-white/10 mt-2">
                © {new Date().getFullYear()} hky.bio. All rights reserved.
            </p>
        </footer>
    )
}
