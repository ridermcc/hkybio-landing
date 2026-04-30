'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Cropper, { Point, Area } from 'react-easy-crop'
import { ImageUpload } from './ImageUpload'
import { getCroppedImage } from '@/lib/utils/image'
import { uploadImage, deleteImage } from '@/lib/supabase/storage'

interface PhotoEditorPanelProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    originalImageUrl?: string
    playerName: string
    onSave: (imageUrl: string, originalImageUrl: string) => void
}

export function PhotoEditorPanel({
    isOpen,
    onClose,
    imageUrl,
    originalImageUrl,
    playerName,
    onSave
}: PhotoEditorPanelProps) {
    const [mounted, setMounted] = useState(false)
    const [view, setView] = useState<'manager' | 'cropper'>(imageUrl ? 'manager' : 'cropper')
    const [tempImageUrl, setTempImageUrl] = useState(originalImageUrl || imageUrl)
    const [previewUrl, setPreviewUrl] = useState(imageUrl)

    // Cropper state
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const [yOffset, setYOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const dragStartY = useRef(0)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen) {
            const currentScrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${currentScrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            document.body.dataset.scrollY = currentScrollY.toString();

            // Reset state
            setPreviewUrl(imageUrl)
            setTempImageUrl(originalImageUrl || imageUrl)
            setView(imageUrl ? 'manager' : 'cropper')
            setCrop({ x: 0, y: 0 })
            setZoom(1)
            setCroppedAreaPixels(null)
            setYOffset(0)
            setIsSaving(false)
        }

        return () => {
            if (document.body.style.position === 'fixed') {
                const storedScrollY = document.body.dataset.scrollY;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                if (storedScrollY) {
                    window.scrollTo({ top: parseInt(storedScrollY), behavior: 'instant' });
                }
            }
        };
    }, [isOpen, imageUrl, originalImageUrl])

    const handleDragStart = (e: React.TouchEvent | React.MouseEvent, clientY: number) => {
        // Don't drag if interacting with cropper or sliders
        if ((e.target as Element).closest('.react-easy-crop_container') ||
            (e.target as Element).closest('input[type="range"]') ||
            (e.target as Element).closest('button')) return

        dragStartY.current = clientY
        setIsDragging(true)
    }

    const handleDragMove = (clientY: number) => {
        if (!isDragging) return
        const delta = clientY - dragStartY.current
        if (delta > 0) setYOffset(delta)
    }

    const handleDragEnd = () => {
        if (!isDragging) return
        setIsDragging(false)
        if (yOffset > 100) {
            onClose()
        } else {
            setYOffset(0)
        }
    }

    const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels)
    }, [])

    const handleSave = async () => {
        if (!tempImageUrl) {
            onClose()
            return
        }

        setIsSaving(true)
        try {
            let finalImageUrl = tempImageUrl
            let finalOriginalUrl = tempImageUrl

            if (croppedAreaPixels) {
                // 1. Crop on canvas
                const croppedFile = await getCroppedImage(
                    tempImageUrl,
                    croppedAreaPixels,
                    `crop-${Date.now()}.jpg`
                )

                // 2. Upload the cropped image
                const { url: croppedUrl, error } = await uploadImage(croppedFile, 'profile')

                if (error || !croppedUrl) {
                    console.error('Failed to upload cropped image:', error)
                    setIsSaving(false)
                    return
                }

                finalImageUrl = croppedUrl
            }

            // 3. Cleanup: Delete old crop if it exists and is different from new one
            if (imageUrl && imageUrl !== finalImageUrl) {
                deleteImage(imageUrl).then(res => {
                    if (!res.success) console.error('PhotoEditorPanel: Old crop deletion failed:', res.error);
                });
            }

            // 4. Return both the new cropped URL and the original temp image URL
            onSave(finalImageUrl, finalOriginalUrl)
            onClose()
        } catch (err) {
            console.error('Save failed:', err)
            setIsSaving(false)
        }
    }

    if (!isOpen || !mounted) return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer overscroll-none touch-none"
                onClick={onClose}
            />

            <div
                className={`relative bg-hky-black border-t border-white/[0.1] rounded-t-3xl h-[85dvh] flex flex-col ${!isDragging ? 'transition-transform duration-200 ease-out animate-slide-up' : ''}`}
                style={{ transform: `translateY(${yOffset}px)` }}
            >
                {/* Header Section */}
                <div
                    className="shrink-0 cursor-grab active:cursor-grabbing touch-none flex flex-col w-full"
                    onTouchStart={e => handleDragStart(e, e.touches[0].clientY)}
                    onTouchMove={e => handleDragMove(e.touches[0].clientY)}
                    onTouchEnd={handleDragEnd}
                    onMouseDown={e => handleDragStart(e, e.clientY)}
                    onMouseMove={e => handleDragMove(e.clientY)}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                >
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                    </div>

                    <div className="flex items-center justify-between px-6 pb-4 border-b border-white/[0.06]">
                        <button
                            onClick={() => view === 'cropper' && imageUrl ? setView('manager') : onClose()}
                            className="p-1 text-white/50 hover:text-white/80 transition-colors"
                            disabled={isSaving}
                        >
                            {view === 'cropper' && imageUrl ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            ) : (
                                <span className="text-[13px] font-medium">Cancel</span>
                            )}
                        </button>

                        <h2 className="text-[15px] font-bold text-white text-center select-none pointer-events-none">
                            {view === 'manager' ? 'Manage Photo' : 'Edit Crop'}
                        </h2>

                        {view === 'cropper' ? (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="text-[13px] font-bold text-white bg-white/[0.08] px-3 py-1 rounded-full hover:bg-white/[0.12] transition-all disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Done'}
                            </button>
                        ) : <div className="w-10" />}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col min-h-0 px-6 py-2 overflow-hidden">
                    {view === 'manager' ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-0 overflow-y-auto">
                            {/* Current Preview */}
                            <div className="w-56 aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.1] bg-white/[0.02] relative group shrink-0">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        className="w-full h-full object-cover"
                                        alt={playerName}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02]">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => {
                                            setTempImageUrl(originalImageUrl || imageUrl);
                                            setView('cropper');
                                        }}
                                        className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-xl"
                                    >
                                        Adjust Crop
                                    </button>
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="relative">
                                    <ImageUpload
                                        variant="button"
                                        folder="profile"
                                        className="w-full"
                                        onChange={(url) => {
                                            setTempImageUrl(url);
                                            setCrop({ x: 0, y: 0 });
                                            setZoom(1);
                                            setCroppedAreaPixels(null);
                                            setView('cropper');
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setTempImageUrl(originalImageUrl || imageUrl);
                                        setView('cropper');
                                    }}
                                    className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl text-white font-bold text-[13px] transition-all"
                                >
                                    Adjust Image Position
                                </button>
                                <button
                                    onClick={() => {
                                        // Cleanup old crop if it exists
                                        if (imageUrl) {
                                            deleteImage(imageUrl).then(res => {
                                                if (!res.success) console.error('PhotoEditorPanel: Remove photo crop cleanup failed:', res.error);
                                            });
                                        }
                                        onSave('', '');
                                        onClose();
                                    }}
                                    className="w-full py-3 text-red-400 font-bold text-[13px] hover:bg-red-400/10 rounded-xl transition-all"
                                >
                                    Remove Photo
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="relative flex-1 min-h-0 bg-black/40 rounded-2xl overflow-hidden border border-white/[0.05]">
                                {tempImageUrl ? (
                                    <Cropper
                                        image={tempImageUrl}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={4 / 3}
                                        onCropChange={setCrop}
                                        onCropComplete={onCropComplete}
                                        onZoomChange={setZoom}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                                        <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
                                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-white">No photo uploaded</p>
                                        </div>
                                        <ImageUpload
                                            variant="button"
                                            folder="profile"
                                            onChange={(url) => {
                                                setTempImageUrl(url);
                                                setView('cropper');
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Saving overlay */}
                                {isSaving && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-50">
                                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="shrink-0 pt-6 pb-2 space-y-5">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Zoom</span>
                                        <span className="text-[10px] font-mono text-white/60">{zoom.toFixed(1)}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="w-full h-1.5 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-white"
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="pt-2 text-center">
                                    <p className="text-[11px] text-white/40 font-medium italic">
                                        Drag image to adjust framing
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
