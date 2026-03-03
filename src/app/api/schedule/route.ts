import { NextRequest, NextResponse } from "next/server";
import { getSchedule } from "@/lib/llm-schedule";
import { unstable_cache } from "next/cache";

const getCachedSchedule = unstable_cache(
    async (url: string) => getSchedule(url),
    ['schedule-cache'],
    { revalidate: 3600, tags: ['schedule'] }
);

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url')
    if (!url) {
        return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
    }
    try {
        const testData = await getCachedSchedule(url)
        if (!testData) {
            return NextResponse.json({ error: 'Failed to fetch calendar - No upcoming games?' }, { status: 404 })
        }
        return NextResponse.json(testData)

    } catch (error) {
        console.error("Schedule fetch error:", error);
        return NextResponse.json({ error: 'Failed to parse calendar' }, { status: 500 })
    }

}