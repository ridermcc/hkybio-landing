import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; hkybio/1.0)',
            },
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch URL' },
                { status: 502 }
            );
        }

        const html = await response.text();

        // Parse OG tags from HTML
        const getMetaContent = (property: string): string | null => {
            // Match both property="og:X" and name="og:X" patterns
            const regex = new RegExp(
                `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
                'i'
            );
            const match = html.match(regex);
            return match ? (match[1] || match[2] || null) : null;
        };

        // Also try to get <title> as fallback
        const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const titleTag = titleTagMatch ? titleTagMatch[1].trim() : null;

        // Decode common HTML entities
        const decodeEntities = (str: string): string =>
            str.replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&#x27;/g, "'");

        const ogTitle = getMetaContent('og:title') || titleTag;
        const ogImage = getMetaContent('og:image');
        const ogDescription = getMetaContent('og:description');
        const ogSiteName = getMetaContent('og:site_name');

        return NextResponse.json(
            {
                title: ogTitle ? decodeEntities(ogTitle) : null,
                image: ogImage ? decodeEntities(ogImage) : null,
                description: ogDescription ? decodeEntities(ogDescription) : null,
                siteName: ogSiteName ? decodeEntities(ogSiteName) : null,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
                },
            }
        );
    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch metadata' },
            { status: 500 }
        );
    }
}
