'use client';

import React, { useState, useRef, useEffect } from 'react';

const COUNTRIES = [
    { code: 'CA', name: 'Canada' },
    { code: 'US', name: 'USA' },
    { code: 'SE', name: 'Sweden' },
    { code: 'FI', name: 'Finland' },
    { code: 'RU', name: 'Russia' },
    { code: 'CZ', name: 'Czechia' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'DE', name: 'Germany' },
];

interface CountrySelectorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function CountrySelector({ value, onChange, className = '' }: CountrySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-full h-full appearance-none bg-white/[0.04] border border-white/[0.1] hover:border-white/[0.2] rounded-lg px-3 py-2 focus:outline-none focus:border-white/40 cursor-pointer transition-colors"
            >
                {value ? (
                    <img
                        src={`/flags/${value.toLowerCase()}.svg`}
                        alt={value}
                        className="w-5 h-3.5 object-cover rounded-[2px]"
                    />
                ) : (
                    <span className="text-[10px] text-white/50">Flag</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full mt-1 left-1/2 -translate-x-1/2 bg-[#121217] border border-white/[0.1] rounded-lg shadow-xl overflow-hidden w-max min-w-[140px]">
                    <div className="max-h-[240px] overflow-y-auto overflow-x-hidden">
                        {COUNTRIES.map(country => (
                            <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                    onChange(country.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors ${value === country.code ? 'bg-white/10 text-white' : 'text-white/80'
                                    }`}
                            >
                                <img
                                    src={`/flags/${country.code.toLowerCase()}.svg`}
                                    alt={country.code}
                                    className="w-5 h-3.5 object-cover rounded-[2px]"
                                />
                                <span className="text-[13px] font-medium">{country.code}</span>
                                <span className="text-[10px] text-white/30 ml-auto">{country.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
