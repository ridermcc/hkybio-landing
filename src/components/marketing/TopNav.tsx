'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

export default function TopNav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Overlay to close menu when clicking outside - only visible when open */}
            <div
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            <div className="fixed top-[max(12px,env(safe-area-inset-top,12px))] left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 pointer-events-none flex justify-center">
                <nav
                    className={`w-full max-w-5xl bg-hky-black/70 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto overflow-hidden relative z-50 ${isOpen ? 'rounded-[24px]' : 'rounded-full'
                        }`}
                >
                    <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between">
                        <Link href="/" className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0 hover:opacity-80 transition-opacity">
                            <Image
                                src="/logo-white.svg"
                                alt="hky.bio Logo"
                                width={32}
                                height={32}
                                className="w-10 h-10 sm:w-12 sm:h-12"
                            />
                            <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                                hky.bio
                            </span>
                        </Link>


                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 -mr-2 text-white/80 hover:text-white transition-colors focus:outline-none"
                            aria-label="Toggle menu"
                            aria-expanded={isOpen}
                        >
                            <div className="relative w-6 h-6 flex items-center justify-center">
                                <span className={`absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`} />
                                <span className={`absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                                <span className={`absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}`} />
                            </div>
                        </button>
                    </div>

                    <div
                        className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-3 sm:pb-4' : 'grid-rows-[0fr] opacity-0 pb-0'
                            }`}
                    >
                        <div className="overflow-hidden px-3 sm:px-4 flex flex-col gap-2">
                            <button
                                disabled
                                className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-white/40 cursor-not-allowed select-none transition-colors hover:text-white/60 bg-white/5 rounded-xl border border-white/5"
                            >
                                <span>Log in</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ice-700/20 text-ice-600">COMING SOON</span>
                            </button>
                        </div>
                    </div>
                </nav >
            </div >
        </>
    );
}
