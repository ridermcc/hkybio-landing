import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileEditorClient } from './ProfileEditorClient'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const metadata = {
    title: 'Dashboard | hky.bio',
    description: 'Edit your hky.bio player profile.',
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Load the player's full profile by auth_user_id
    const { data: profile } = await supabase
        .from('players')
        .select(`
            *,
            player_social_links(*),
            player_highlights(*),
            player_representatives(*),
            player_sponsors(*),
            player_games(*),
            player_journey(*),
            player_stats(*),
            player_articles(*)
        `)
        .eq('auth_user_id', user.id)
        .maybeSingle()

    if (!profile) {
        // No player profile linked — create it automatically using the requested username from signup

        const fallbackUsername = `player_${user.id.substring(0, 8)}`
        const desiredUsername = user.user_metadata?.username || fallbackUsername

        let targetUsername = desiredUsername
        let insertError = null

        // Retry loop handles race conditions where the username may have been
        // claimed between availability-check and insert (DB UNIQUE constraint)
        for (let attempt = 0; attempt < 3; attempt++) {
            const { error } = await supabaseAdmin
                .from('players')
                .insert({
                    auth_user_id: user.id,
                    username: targetUsername,
                    full_name: user.user_metadata?.full_name || '',
                    current_team: user.user_metadata?.team || '',
                    current_league: user.user_metadata?.league || '',
                })

            if (!error) {
                insertError = null
                break
            }

            // Check if it's a unique constraint violation
            if (error.code === '23505') {
                // Append a random suffix and retry
                targetUsername = `${desiredUsername}_${Math.floor(Math.random() * 9000 + 1000)}`
                insertError = error
                continue
            }

            // Non-conflict error — break immediately
            insertError = error
            break
        }

        if (insertError) {
            console.error('Initial profile creation failed:', insertError)
            return (
                <div className="min-h-screen bg-hky-black text-white flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold">Account Setup Error</h1>
                        <p className="text-white/40 text-sm">Failed to create your default profile.</p>
                    </div>
                </div>
            )
        }

        // Refresh the page state to load the newly created profile into the editor
        redirect('/dashboard')
    }

    // Sort relations by display_order
    const sponsors = (profile.player_sponsors || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    const journey = (profile.player_journey || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    const socialLinks = (profile.player_social_links || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    const highlights = (profile.player_highlights || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    const representatives = (profile.player_representatives || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    const playerStatsList = (profile.player_stats || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    const articles = (profile.player_articles || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))

    const currentStats = playerStatsList.length > 0 ? playerStatsList[0] : null
    const topRep = representatives.length > 0 ? representatives[0] : null
    const rawGames = (profile.player_games || []).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))

    const linkItems: { id: string, size: 'standard' | 'compact', link: any }[] = [];
    let sponsorIndex = 0;

    const rawSections = (profile.section_order as string[] | null) || inferSections()
    const newSections = []

    for (const section of rawSections) {
        if (section === 'footer') {
            continue;
        }

        // Link items (Compact or Showcase)
        if (section.startsWith('linkitem-')) {
            const s = sponsors[sponsorIndex]
            if (s) {
                // Extract size from ID: linkitem-compact-xxx or linkitem-standard-xxx
                let size: 'compact' | 'standard' = 'standard'
                if (section.startsWith('linkitem-compact-')) size = 'compact'
                else if (section.startsWith('linkitem-standard-')) size = 'standard'

                linkItems.push({
                    id: section,
                    size,
                    link: {
                        name: s.name,
                        imageUrl: s.image_url,
                        linkUrl: s.link_url,
                        description: s.description || '',
                    },
                })
                newSections.push(section)
                sponsorIndex += 1
            }
        } else {
            newSections.push(section)
        }
    }

    const initialData = {
        playerId: profile.id,
        hero: {
            playerName: profile.full_name || '',
            username: profile.username || '',
            imageUrl: profile.photo_url || '',
            nationality: profile.nationality || '',
            teamName: profile.current_team || '',
            leagueName: profile.current_league || '',
            bio: profile.bio || '',
            socialLinks: socialLinks.map((l: any) => ({
                id: l.id,
                platform: l.platform,
                url: l.url,
                logo_url: l.logo_url,
            })),
            originalImageUrl: profile.photo_original_url,
        },
        stats: {
            season: currentStats?.season || '2025-26',
            stats: currentStats?.stats || [],
            bio: {
                birthYear: profile.birth_year,
                position: profile.position,
                shoots_catches: profile.shoots_catches,
                height: profile.height_display,
                weight: profile.weight_display,
            },
            showBio: profile.show_stats_bio || false,
        },
        schedule: {
            scheduleUrl: profile.schedule_url || '',
            games: rawGames.map((g: any) => ({
                id: g.id,
                opponent: g.opponent,
                date: g.game_date,
                time: g.game_time,
                location: g.location,
                isHome: g.is_home,
            })),
        },
        video: {
            url: highlights.length > 0 ? highlights[0].video_url : '',
            title: highlights.length > 0 ? highlights[0].title || '' : '',
        },
        journey: {
            stops: journey.map((j: any) => ({
                id: j.id,
                teamName: j.team_name,
                league: j.league,
                startYear: j.start_year,
                endYear: j.end_year || undefined,
                accolades: j.accolades || [],
            })),
        },
        linkItems,
        articles: {
            urls: articles.map((a: any) => a.article_url),
            sectionTitle: profile.articles_title || 'In The News',
        },
        footer: {
            mode: topRep ? 'represented' as const : 'player' as const,
            playerName: profile.full_name || '',
            teamName: profile.current_team || '',
            leagueName: profile.current_league || '',
            agentName: topRep?.name || '',
            agencyName: topRep?.company || '',
        },
        sections: newSections,
        disabledSections: profile.disabled_sections || [],
    }

    function inferSections() {
        const sections: string[] = []
        if (currentStats) sections.push('stats')
        if (profile.schedule_url || (profile.player_games && profile.player_games.length > 0)) sections.push('schedule')
        if (highlights.length > 0) sections.push('video')
        if (journey.length > 0) sections.push('journey')
        if (sponsors.length > 0) sections.push('linkitem-compact-0')
        if (articles.length > 0) sections.push('articles')
        return sections
    }

    return <ProfileEditorClient initialData={initialData} />
}
