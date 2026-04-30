import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const parsed = new URL(url);

        // Only allow HTTPS
        if (parsed.protocol !== 'https:') {
            return NextResponse.json({ error: 'Only HTTPS URLs are allowed' }, { status: 400 });
        }

        // Block private/internal IPs and localhost (SSRF protection)
        const hostname = parsed.hostname.toLowerCase();
        const blockedPatterns = [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            '169.254.',       // link-local / cloud metadata
            '10.',            // private class A
            '192.168.',       // private class C
            'metadata.google',
            '[::1]',
        ];
        if (
            blockedPatterns.some(p => hostname.startsWith(p)) ||
            hostname.match(/^172\.(1[6-9]|2\d|3[01])\./) || // private class B
            hostname.endsWith('.internal') ||
            hostname.endsWith('.local')
        ) {
            return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; hkybio/1.0)',
            },
            signal: AbortSignal.timeout(5000),
            redirect: 'follow',
        });


        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch URL: ${response.status}` },
                { status: 502 }
            );
        }

        // Detect charset from headers
        const contentType = response.headers.get('content-type');
        let charset = 'utf-8';
        if (contentType) {
            const match = contentType.match(/charset=([^;]+)/i);
            if (match) charset = match[1].trim();
        }

        // Read body as array buffer for flexible decoding
        const buffer = await response.arrayBuffer();
        let html = '';

        try {
            const decoder = new TextDecoder(charset);
            html = decoder.decode(buffer);
        } catch {
            // Fallback to utf-8 if specified charset is invalid
            html = new TextDecoder('utf-8').decode(buffer);
        }

        // Check for <meta charset> in HTML as a fallback/override
        // (Many sites don't set the header but have the meta tag)
        const metaCharsetMatch = html.match(/<meta[^>]+charset=["']?([^"' >/]+)["']?/i);
        if (metaCharsetMatch) {
            const metaCharset = metaCharsetMatch[1].toLowerCase().trim();
            if (metaCharset && metaCharset !== charset.toLowerCase()) {
                try {
                    const betterDecoder = new TextDecoder(metaCharset);
                    html = betterDecoder.decode(buffer);
                } catch {
                    // Ignore if decoder fails
                }
            }
        }

        // Use cheerio for robust parsing
        const $ = cheerio.load(html);

        // Extract metadata using cheerio (automatically handles entities)
        let ogTitle = $('meta[property="og:title"]').attr('content') || 
                        $('meta[name="og:title"]').attr('content') || 
                        $('title').text().trim() ||
                        null;

        const ogImage = $('meta[property="og:image"]').attr('content') || 
                        $('meta[name="og:image"]').attr('content') || 
                        null;

        const ogDescription = $('meta[property="og:description"]').attr('content') || 
                              $('meta[name="og:description"]').attr('content') || 
                              null;

        const ogSiteName = $('meta[property="og:site_name"]').attr('content') || 
                           $('meta[name="og:site_name"]').attr('content') || 
                           null;

        // Clean up Instagram titles
        if (ogTitle && (hostname.includes('instagram.com') || ogSiteName?.toLowerCase().includes('instagram'))) {
            // Instagram titles often look like "Name on Instagram: 'Caption'" or "Name on Instagram: Caption"
            const instagramPrefix = /^.*? on Instagram: /i;
            if (instagramPrefix.test(ogTitle)) {
                let cleanedTitle = ogTitle.replace(instagramPrefix, '').trim();
                // Remove surrounding quotes if they exist
                if ((cleanedTitle.startsWith('"') && cleanedTitle.endsWith('"')) || 
                    (cleanedTitle.startsWith("'") && cleanedTitle.endsWith("'"))) {
                    cleanedTitle = cleanedTitle.substring(1, cleanedTitle.length - 1).trim();
                }
                ogTitle = cleanedTitle;
            }
        }

        return NextResponse.json(
            {
                title: ogTitle,
                image: ogImage,
                description: ogDescription,
                siteName: ogSiteName,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
                },
            }
        );
    } catch (error) {
        console.error('OG API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch metadata' },
            { status: 500 }
        );
    }
}
