'use client';

import React, { useRef, useState } from 'react';
import { uploadImage } from '@/lib/supabase/storage';

import { optimizeImage } from '@/lib/utils/image';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    folder?: string;
    placeholder?: string;
    className?: string;
    variant?: 'button' | 'ghost';
}

export function ImageUpload({
    value,
    onChange,
    folder = 'misc',
    placeholder = 'https://...',
    className = '',
    variant = 'button'
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<'idle' | 'converting' | 'optimizing' | 'uploading'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setError('File must be an image');
            return;
        }

        const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
        setStatus(isHeic ? 'converting' : 'optimizing');
        setError(null);

        try {
            // Optimize image before upload
            const optimizedFile = await optimizeImage(file, {
                maxWidth: 1600,
                maxHeight: 1600,
                quality: 0.8,
                maxFileSize: 400 * 1024 // target 400KB limit
            });

            setStatus('uploading');
            const { url, error: uploadError } = await uploadImage(optimizedFile, folder);

            if (uploadError) {
                setError(uploadError);
            } else if (url) {
                onChange(url); // Pass the new URL back to the parent
            }
        } catch (err: any) {
            setError(err.message || 'Failed to process image');
        } finally {
            setStatus('idle');
            // Reset input so the same file could be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const isProcessing = status !== 'idle';

    return (
        <div className={`relative flex flex-col ${variant === 'ghost' ? 'h-full w-full' : 'w-full'} ${className}`}>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className={`flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variant === 'button'
                    ? 'w-full py-2 px-3 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] rounded-lg text-[11px] font-bold text-white backdrop-blur-sm'
                    : 'absolute inset-0 w-full h-full bg-transparent p-0 border-none'
                    }`}
            >
                {isProcessing && (
                    <div className={`flex items-center justify-center ${variant === 'ghost'
                        ? 'absolute inset-0 z-50 bg-black/40 backdrop-blur-md animate-in fade-in duration-300'
                        : ''
                        }`}>
                        <svg className={`animate-spin ${variant === 'ghost' ? 'h-5 w-5' : 'h-3 w-3'} text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                {!isProcessing && variant === 'button' && (
                    <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {value ? "Change Image" : "Upload New Photo"}
                    </div>
                )}
            </button>
            {error && (
                <div className="text-[9px] text-red-400 mt-1 text-center">
                    {error}
                </div>
            )}
        </div>
    );
}
