import React from 'react'

export function PlayerRepresentation({ agentName, agencyName }: { agentName: string, agencyName: string }) {
    return (
        <div className="w-full py-1.5 px-4 text-center animate-fade-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20 mb-1.5">
                Represented by
            </p>
            <p className="text-[13px] font-medium text-white/70">{agentName}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{agencyName}</p>
        </div>
    )
}