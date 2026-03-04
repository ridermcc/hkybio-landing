import { NextRequest, NextResponse } from "next/server";
import { getSchedule } from "@/lib/llm-schedule";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

const getCachedSchedule = unstable_cache(
    async (url: string) => getSchedule(url),
    ['schedule-cache'],
    { revalidate: 3600, tags: ['schedule'] }
);

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url')
    const playerId = request.nextUrl.searchParams.get('playerId')

    if (!url) {
        return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
    }
    try {
        const testData = await getCachedSchedule(url)
        if (!testData || !testData.games || testData.games.length === 0) {
            return NextResponse.json({ error: 'Failed to fetch calendar - No upcoming games?' }, { status: 404 })
        }

        if (playerId) {
            const supabase = await createAdminClient()

            // Map the games to DB format
            const gamesToInsert = testData.games.map((g: any, index: number) => ({
                player_id: playerId,
                opponent: g.opponent,
                is_home: g.isHome,
                game_date: g.date,
                game_time: g.time,
                location: g.location,
                display_order: index
            }))

            // Delete existing games to avoid duplicates if refresh happens multiple times quickly
            await supabase
                .from('player_games')
                .delete()
                .eq('player_id', playerId)

            const { error } = await supabase
                .from('player_games')
                .insert(gamesToInsert)

            if (error) {
                console.error("Error inserting games to DB:", error)
            }
        }

        return NextResponse.json(testData)

    } catch (error) {
        console.error("Schedule fetch error:", error);
        return NextResponse.json({ error: 'Failed to parse calendar' }, { status: 500 })
    }

}