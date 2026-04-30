'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ArticleMeta {
    id: string;
    url: string;
    title: string | null;
    image: string | null;
    siteName: string | null;
    loading: boolean;
    error: boolean;
    imgSrc: string | null;
    imgFailed: boolean;
}

export interface ArticlesEditData {
    urls: string[];
    sectionTitle?: string;
}

interface PlayerArticlesProps {
    urls: string[];
    sectionTitle?: string;
    isEditing?: boolean;
    onChange?: (data: ArticlesEditData) => void;
}

function SortableArticleRow({
    article,
    index,
    removeArticle,
    handleImgError
}: {
    article: ArticleMeta;
    index: number;
    removeArticle: (index: number) => void;
    handleImgError: (id: string) => void;
}) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (showDeleteConfirm) {
            const currentScrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${currentScrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            document.body.dataset.scrollY = currentScrollY.toString();
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
    }, [showDeleteConfirm]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: article.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/[0.1] relative mb-2 group/article shadow-sm transition-all ${isDragging ? 'opacity-50 border-white/30 scale-[1.02]' : ''}`}
        >
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Drag Handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 p-2.5 -ml-2.5 transition-colors touch-none flex-shrink-0"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
                        <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>

                {/* Thumbnail */}
                <div className="w-10 h-10 flex-shrink-0 rounded bg-white/[0.04] border border-white/[0.08] overflow-hidden relative flex items-center justify-center">
                    {article.loading ? (
                        <div className="absolute inset-0 animate-pulse bg-white/[0.05]" />
                    ) : article.imgSrc && !article.imgFailed ? (
                        <img
                            src={article.imgSrc}
                            alt=""
                            onError={() => handleImgError(article.id)}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-lg opacity-50">📰</span>
                    )}
                </div>

                {/* Article Info */}
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-white truncate w-full pr-4">
                        {article.loading ? 'Loading...' : (article.title || article.url)}
                    </span>
                    <span className="text-[10px] text-white/40 truncate w-full">
                        {article.url}
                    </span>
                </div>
            </div>

            {/* Remove Button */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="w-7 h-7 flex-shrink-0 rounded-full text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover/article:opacity-100"
                title="Remove article"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm overscroll-none touch-none" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}>
                    <div className="bg-hky-black border border-white/[0.1] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 flex items-center justify-center text-red-400">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white">Delete article?</h3>
                        </div>
                        <p className="text-white/60 text-sm mb-6 mt-2">
                            Are you sure you want to remove this article? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeArticle(index); setShowDeleteConfirm(false); }}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-400 rounded-xl transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export function PlayerArticles({ urls, sectionTitle, isEditing = false, onChange }: PlayerArticlesProps) {
    const [articles, setArticles] = useState<ArticleMeta[]>(() =>
        urls.map((url) => ({
            id: `article-${Math.random().toString(36).substr(2, 9)}`,
            url,
            title: null,
            image: null,
            siteName: null,
            loading: true,
            error: false,
            imgSrc: null,
            imgFailed: false,
        }))
    );
    const [newUrl, setNewUrl] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 8 } }),
        useSensor(KeyboardSensor)
    );

    // Sync `urls` prop with internal `articles` state, preserving stable IDs
    useEffect(() => {
        setArticles((prev) => {
            const unusedPrev = [...prev];
            return urls.map((url) => {
                const index = unusedPrev.findIndex((a) => a.url === url);
                if (index !== -1) {
                    const existing = unusedPrev[index];
                    unusedPrev.splice(index, 1);
                    return existing;
                }
                return {
                    id: `article-${Math.random().toString(36).substr(2, 9)}`,
                    url,
                    title: null,
                    image: null,
                    siteName: null,
                    loading: true,
                    error: false,
                    imgSrc: null,
                    imgFailed: false,
                };
            });
        });
    }, [urls]);

    // Fetch OG data for any loading articles
    useEffect(() => {
        articles.forEach((article) => {
            if (!article.loading || !article.url.trim()) return;

            fetch(`/api/og?url=${encodeURIComponent(article.url)}`)
                .then((res) => res.json())
                .then((data) => {
                    setArticles((prev) =>
                        prev.map((a) =>
                            a.id === article.id
                                ? { ...a, title: data.title || null, image: data.image || null, siteName: data.siteName || null, imgSrc: data.image || null, loading: false }
                                : a
                        )
                    );
                })
                .catch(() => {
                    setArticles((prev) =>
                        prev.map((a) =>
                            a.id === article.id
                                ? { ...a, loading: false, error: true }
                                : a
                        )
                    );
                });
        });
    }, [articles]);

    const handleImgError = (id: string) => {
        setArticles((prev) =>
            prev.map((a) => {
                if (a.id === id) {
                    if (a.image && a.imgSrc === a.image) {
                        return { ...a, imgSrc: `/api/img?url=${encodeURIComponent(a.image)}` };
                    }
                    return { ...a, imgFailed: true };
                }
                return a;
            })
        );
    };

    const removeArticle = (index: number) => {
        if (!onChange) return;
        onChange({ urls: urls.filter((_, i) => i !== index), sectionTitle: sectionTitle || '' });
    };

    const addArticle = () => {
        const trimmed = newUrl.trim();
        if (!onChange || !trimmed) return;

        // Basic URL validation
        let validUrl = trimmed;
        if (!/^https?:\/\//i.test(validUrl)) {
            validUrl = 'https://' + validUrl;
        }

        onChange({ urls: [validUrl, ...urls], sectionTitle: sectionTitle || '' });
        setNewUrl('');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !onChange) return;

        const oldIndex = articles.findIndex((a) => a.id === active.id);
        const newIndex = articles.findIndex((a) => a.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            onChange({ urls: arrayMove(urls, oldIndex, newIndex), sectionTitle: sectionTitle || '' });
        }
    };

    if (!urls || urls.length === 0) {
        if (isEditing) {
            return (
                <div className="w-full flex flex-col gap-5 px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
                    {/* Section Title Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Section Title</label>
                        <input
                            type="text"
                            value={sectionTitle || ''}
                            onChange={e => onChange?.({ urls, sectionTitle: e.target.value })}
                            placeholder="Section Title (e.g. In the News)"
                            className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50 placeholder:text-white/20"
                        />
                    </div>

                    <div className="border border-dashed border-white/[0.08] rounded-xl py-10 flex flex-col items-center gap-3">
                        <span className="text-white/30 text-[13px]">No articles added</span>
                        <div className="flex flex-col sm:flex-row items-center gap-2 mt-1 w-full max-w-sm px-4">
                            <input
                                type="url"
                                value={newUrl}
                                onChange={e => setNewUrl(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addArticle()}
                                placeholder="https://..."
                                className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                            />
                            <button
                                onClick={addArticle}
                                className="w-full sm:w-auto px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:text-white/80 transition-colors whitespace-nowrap"
                                data-testid="add-article"
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }

    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return '';
        }
    };

    // edit mode - vertical list (new articles added to top of order auto)
    if (isEditing && onChange) {
        return (
            <div className="flex flex-col gap-5 px-4 pb-4">
                {/* Section Title Input */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Section Title</label>
                    <input
                        type="text"
                        value={sectionTitle || ''}
                        onChange={e => onChange({ urls, sectionTitle: e.target.value })}
                        placeholder="Section Title (e.g. In the News)"
                        className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50 placeholder:text-white/20"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Add Article</label>
                    <div className="flex gap-2">
                    <input
                        type="url"
                        value={newUrl}
                        onChange={e => setNewUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addArticle()}
                        placeholder="Paste article URL..."
                        className="flex-1 bg-black/40 border border-white/[0.1] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-white/50"
                    />
                    <button
                        type="button"
                        onClick={addArticle}
                        disabled={!newUrl.trim()}
                        className={`px-4 py-2 rounded-lg text-[13px] font-bold tracking-wide uppercase border transition-all whitespace-nowrap
                                    ${!newUrl.trim()
                                ? 'bg-transparent text-white/20 border-white/[0.08]'
                                : 'bg-white/10 text-white border-white/20 hover:bg-white/20 active:scale-95'}`}
                    >
                        Add
                    </button>
                </div>
            </div>
            <div className="flex flex-col">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={articles.map(a => a.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {articles.map((article, index) => (
                                <SortableArticleRow
                                    key={article.id}
                                    article={article}
                                    index={index}
                                    removeArticle={removeArticle}
                                    handleImgError={handleImgError}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        );
    }

    const isOdd = articles.length % 2 !== 0;

    // View Mode (Grid/Row Layout)
    return (
        <section className="w-full py-4 lg:py-3">
            {sectionTitle && (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-3 px-4 text-center">{sectionTitle}</p>
            )}
            <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-3 lg:gap-3">
                {articles.map((article, index) => {
                    const isFirstAndOdd = isOdd && index === 0;

                    return (
                        <a
                            key={article.id}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group relative rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06] transition-all duration-200 ease-out hover:border-white/20
                                ${isFirstAndOdd ? 'col-span-2 h-[180px] lg:col-span-1 lg:h-[160px]' : 'h-[140px] lg:h-[160px]'}
                            `}
                        >
                            {/* Loading skeleton */}
                            {article.loading && (
                                <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />
                            )}

                            {/* Background image */}
                            {article.imgSrc && !article.loading && !article.imgFailed && (
                                <img
                                    src={article.imgSrc}
                                    alt=""
                                    onError={() => handleImgError(article.id)}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}

                            {/* No-image fallback */}
                            {(!article.imgSrc || article.imgFailed) && !article.loading && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-hky-dark flex items-center justify-center">
                                    <span className={isFirstAndOdd ? "text-[40px]" : "text-[28px]"}>📰</span>
                                </div>
                            )}

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent" />

                            {/* Text content */}
                            <div className={`absolute bottom-0 left-0 right-0 ${isFirstAndOdd ? 'p-4' : 'p-2.5'}`}>
                                {article.title && !article.loading && (
                                    <p className={`${isFirstAndOdd ? 'text-[13px]' : 'text-[10px]'} font-medium leading-tight text-white line-clamp-3`}>
                                        {article.title}
                                    </p>
                                )}
                                {!article.loading && (
                                    <p className={`${isFirstAndOdd ? 'text-[10px]' : 'text-[9px]'} text-white/40 mt-1 truncate font-medium`}>
                                        {article.siteName || getDomain(article.url)}
                                    </p>
                                )}
                            </div>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}

