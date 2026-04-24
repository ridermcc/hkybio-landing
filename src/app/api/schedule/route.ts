import { NextRequest, NextResponse } from "next/server";
import { getSchedule } from "@/lib/llm-schedule";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const getCachedSchedule = unstable_cache(
    async (url: string) => getSchedule(url),
    ['schedule-cache'],
    { revalidate: 3600, tags: ['schedule'] }
);

export async function GET(request: NextRequest) {
    // Require authentication to prevent LLM cost abuse
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = request.nextUrl.searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
    }

    // Validate the URL is a proper HTTPS URL
    try {
        const parsed = new URL(url)
        if (parsed.protocol !== 'https:') {
            return NextResponse.json({ error: 'Only HTTPS URLs are supported' }, { status: 400 })
        }
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    try {
        const testData = await getCachedSchedule(url)
        if (!testData || !testData.games || testData.games.length === 0) {
            return NextResponse.json({ error: 'Failed to fetch calendar - No upcoming games?' }, { status: 404 })
        }

        return NextResponse.json(testData)

    } catch (error) {
        console.error("Schedule fetch error:", error);
        return NextResponse.json({ error: 'Failed to parse calendar' }, { status: 500 })
    }

}