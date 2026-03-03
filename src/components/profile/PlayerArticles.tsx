'use client';

import React, { useEffect, useState } from 'react';

interface ArticleMeta {
    url: string;
    title: string | null;
    image: string | null;
    siteName: string | null;
    loading: boolean;
    error: boolean;
    imgSrc: string | null;   // actual src being used (direct or proxied)
    imgFailed: boolean;       // true only after proxy also fails
}

interface PlayerArticlesProps {
    urls: string[];
}

export function PlayerArticles({ urls }: PlayerArticlesProps) {
    const [articles, setArticles] = useState<ArticleMeta[]>(
        urls.map((url) => ({
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

    useEffect(() => {
        urls.forEach((url, index) => {
            fetch(`/api/og?url=${encodeURIComponent(url)}`)
                .then((res) => res.json())
                .then((data) => {
                    setArticles((prev) => {
                        const updated = [...prev];
                        updated[index] = {
                            ...updated[index],
                            title: data.title || null,
                            image: data.image || null,
                            siteName: data.siteName || null,
                            imgSrc: data.image || null, // start with direct URL
                            loading: false,
                        };
                        return updated;
                    });
                })
                .catch(() => {
                    setArticles((prev) => {
                        const updated = [...prev];
                        updated[index] = {
                            ...updated[index],
                            loading: false,
                            error: true,
                        };
                        return updated;
                    });
                });
        });
    }, [urls]);

    const handleImgError = (index: number) => {
        setArticles((prev) => {
            const article = prev[index];
            // If we were loading the direct URL, retry via our proxy
            if (article.image && article.imgSrc === article.image) {
                const updated = [...prev];
                updated[index] = {
                    ...article,
                    imgSrc: `/api/img?url=${encodeURIComponent(article.image)}`,
                };
                return updated;
            }
            // Proxy also failed — show fallback
            const updated = [...prev];
            updated[index] = { ...article, imgFailed: true };
            return updated;
        });
    };

    if (!urls || urls.length === 0) return null;

    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return '';
        }
    };

    return (
        <section className="w-full py-4 animate-fade-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            {/* Section label — centered with decorative lines */}
            <div className="flex items-center justify-center mb-3 px-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/[0.12]" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] px-4">
                    In the News
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/[0.12]" />
            </div>

            {/* Scrollable row — full width */}
            <div
                className="flex gap-2.5 overflow-x-auto pb-1 px-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {articles.map((article, index) => (
                    <a
                        key={index}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex-shrink-0 w-[140px] h-[140px] rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06] transition-all duration-200 ease-out hover:border-white/[0.12] hover:scale-[1.03] active:scale-[0.97]"
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
                                onError={() => handleImgError(index)}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                        )}

                        {/* No-image fallback */}
                        {(!article.imgSrc || article.imgFailed) && !article.loading && (
                            <div className="absolute inset-0 bg-gradient-to-br from-ice-900/40 to-hky-dark flex items-center justify-center">
                                <span className="text-[28px]">📰</span>
                            </div>
                        )}

                        {/* Gradient overlay for text legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Text content */}
                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                            {article.title && !article.loading && (
                                <p className="text-[11px] font-bold leading-tight text-white line-clamp-3">
                                    {article.title}
                                </p>
                            )}
                            {!article.loading && (
                                <p className="text-[9px] text-white/40 mt-1 truncate">
                                    {article.siteName || getDomain(article.url)}
                                </p>
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
