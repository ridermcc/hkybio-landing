import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PUT(request: NextRequest) {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { playerId, sections, hero, stats, schedule, video, journey, sponsors, articles, footer, disabled_sections } = body

    if (!playerId) {
        return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    // Verify the user owns this profile via auth_user_id
    const { data: profile } = await supabase
        .from('players')
        .select('id, auth_user_id')
        .eq('id', playerId)
        .maybeSingle();

    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.auth_user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // Update main player fields
        const playerUpdate: Record<string, any> = {};

        if (sections) {
            playerUpdate.section_order = sections;
        }

        if (disabled_sections) {
            playerUpdate.disabled_sections = disabled_sections;
        }

        if (hero) {
            playerUpdate.full_name = hero.playerName
            playerUpdate.username = hero.username
            playerUpdate.photo_url = hero.imageUrl
            playerUpdate.nationality = hero.nationality
            playerUpdate.current_team = hero.teamName
            playerUpdate.current_league = hero.leagueName
            playerUpdate.bio = hero.bio
            playerUpdate.photo_original_url = hero.originalImageUrl
        }

        if (stats) {
            playerUpdate.birth_year = stats.bio?.birthYear
            playerUpdate.position = stats.bio?.position
            playerUpdate.shoots_catches = stats.bio?.shoots_catches
            playerUpdate.height_display = stats.bio?.height
            playerUpdate.weight_display = stats.bio?.weight
            playerUpdate.show_stats_bio = stats.showBio
        }

        if (schedule) {
            playerUpdate.schedule_url = schedule.scheduleUrl
        }

        if (articles && articles.sectionTitle !== undefined) {
            playerUpdate.articles_title = articles.sectionTitle
        }

        if (Object.keys(playerUpdate).length > 0) {
            const { error: updateError } = await supabaseAdmin
                .from('players')
                .update(playerUpdate)
                .eq('id', playerId)

            if (updateError) {
                throw updateError
            }
        }

        // Save social links
        if (hero?.socialLinks) {
            // Delete existing links first (admin client bypasses RLS)
            const { error: deleteError } = await supabaseAdmin.from('player_social_links').delete().eq('player_id', playerId)
            if (deleteError) throw deleteError

            const allowedLinks = hero.socialLinks.filter((l: any) => l.platform && l.url).slice(0, 6);

            if (allowedLinks.length > 0) {
                // Deduplicate links by platform (keep last one)
                const uniqueLinksMap = new Map<string, any>()
                allowedLinks.forEach((link: any, i: number) => {
                    if (link.platform) {
                        uniqueLinksMap.set(link.platform.toLowerCase(), {
                            player_id: playerId,
                            platform: link.platform.toLowerCase(),
                            url: link.url,
                            logo_url: link.logo_url || null,
                            display_order: i,
                        })
                    }
                })

                const linksToInsert = Array.from(uniqueLinksMap.values())

                if (linksToInsert.length > 0) {
                    const { error: insertError } = await supabaseAdmin
                        .from('player_social_links')
                        .insert(linksToInsert)
                    if (insertError) throw insertError
                }
            }
        }

        // Save stats
        if (stats) {
            const { error: deleteError } = await supabaseAdmin.from('player_stats').delete().eq('player_id', playerId)
            if (deleteError) throw deleteError

            if (stats.stats && stats.stats.length > 0) {
                const { error: insertError } = await supabaseAdmin
                    .from('player_stats')
                    .insert({
                        player_id: playerId,
                        season: stats.season,
                        stats: stats.stats,
                        display_order: 0,
                    })
                if (insertError) throw insertError
            }
        }

        // Save schedule games
        if (schedule && schedule.games) {
            const { error: deleteError } = await supabaseAdmin.from('player_games').delete().eq('player_id', playerId)
            if (deleteError) throw deleteError

            if (schedule.games.length > 0) {
                const gamesToInsert = schedule.games.map((g: any, i: number) => ({
                    player_id: playerId,
                    opponent: g.opponent,
                    is_home: g.isHome !== undefined ? g.isHome : true,
                    game_date: g.date,
                    game_time: g.time,
                    location: g.location,
                    display_order: i,
                }))

                const { error: insertError } = await supabaseAdmin
                    .from('player_games')
                    .insert(gamesToInsert)
                if (insertError) throw insertError
            }
        }

        // Save highlights
        if (video) {
            const { error: deleteError } = await supabaseAdmin.from('player_highlights').delete().eq('player_id', playerId)
            if (deleteError) throw deleteError

            if (video.url) {
                const { error: insertError } = await supabaseAdmin
                    .from('player_highlights')
                    .insert({
                        player_id: playerId,
                        video_url: video.url,
                        title: video.title || null,
                        display_order: 0,
                    })
                if (insertError) throw insertError
            }
        }

        // Save journey
        if (journey?.stops) {
            const { error: deleteError } = await supabaseAdmin.from('player_journey').delete().eq('player_id', playerId)
            if (deleteError) throw deleteError

            if (journey.stops.length > 0) {
                const { error: insertError } = await supabaseAdmin
                    .from('player_journey')
                    .insert(
                        journey.stops.map((stop: any, i: number) => ({
                            player_id: playerId,
                            team_name: stop.teamName,
                            league: stop.league,
                            start_year: stop.startYear,
                            end_year: stop.endYear || null,
                            accolades: stop.accolades || [],
                            display_order: i,
                        }))
                    )
                if (insertError) throw insertError
            }
        }

        // Save sponsors
        if (sponsors?.sponsors) {
            const { error: deleteError } = await supabaseAdmin.from('player_sponsors').delete().eq('player_id', playerId)
            if (deleteError) throw deleteError

            if (sponsors.sponsors.length > 0) {
                const { error: insertError } = await supabaseAdmin
                    .from('player_sponsors')
                    .insert(
                        sponsors.sponsors.map((s: any, i: number) => ({
                            player_id: playerId,
                            name: s.name,
                            image_url: s.imageUrl,
                            link_url: s.linkUrl,
                            description: s.description || null,
                            display_order: i,
                        }))
                    )
                if (insertError) throw insertError
            }
        }

        // Save articles
        if (articles?.urls) {
            const { error: deleteError = null } = await supabaseAdmin.from('player_articles').delete().eq('player_id', playerId)
            if (deleteError) throw deleteError

            if (articles.urls.length > 0) {
                const filteredUrls = articles.urls.filter((u: string) => u.trim())
                if (filteredUrls.length > 0) {
                    const { error: insertError } = await supabaseAdmin
                        .from('player_articles')
                        .insert(
                            filteredUrls.map((url: string, i: number) => ({
                                player_id: playerId,
                                article_url: url,
                                display_order: i,
                            }))
                        )
                    if (insertError) throw insertError
                }
            }
        }

        // Save representatives (footer)
        if (footer) {
            const { error: deleteError } = await supabaseAdmin.from('player_representatives').delete().eq('player_id', playerId)
            if (deleteError) throw deleteError

            if (footer.agentName || footer.agencyName) {
                const { error: insertError } = await supabaseAdmin
                    .from('player_representatives')
                    .insert({
                        player_id: playerId,
                        name: footer.agentName,
                        company: footer.agencyName,
                        display_order: 0,
                    })
                if (insertError) throw insertError
            }
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Profile save error:', err)
        return NextResponse.json({
            error: err.message || 'Failed to save profile'
        }, { status: 500 })
    }
}
