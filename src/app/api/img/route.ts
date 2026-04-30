import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const parsed = new URL(url);
        // Only allow image proxying from known domains
        const allowedHosts = [
            'images.sidearmdev.com',
            'dxbhsrqyrr690.cloudfront.net',
        ];
        if (!allowedHosts.some((h) => parsed.hostname.endsWith(h))) {
            return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
        }
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; hkybio/1.0)',
                'Accept': 'image/*',
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch image' },
                { status: 502 }
            );
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
            },
        });
    } catch {
        return NextResponse.json(
            { error: 'Failed to proxy image' },
            { status: 500 }
        );
    }
}
