import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { PlayerHero } from '@/components/profile/PlayerHero'
import { PlayerArticles } from '@/components/profile/PlayerArticles'
import { PlayerVideo } from '@/components/profile/PlayerVideo'
import { ProfileFooter } from '@/components/profile/ProfileFooter'
import { PlayerJourney } from '@/components/profile/PlayerJourney'
import { PlayerStats } from '@/components/profile/PlayerStats'
import { PlayerSchedule } from '@/components/profile/PlayerSchedule'
import { PlayerSponsors } from '@/components/profile/PlayerSponsors'

type Props = {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('players')
        .select('full_name, username')
        .eq('username', username)
        .maybeSingle()

    if (!profile) {
        return { title: 'Not Found | hky.bio' }
    }

    return {
        title: `${profile.full_name || profile.username} | hky.bio`,
        description: `${profile.full_name || profile.username}'s hockey profile on hky.bio`,
    }
}

export default async function ProfilePage({ params }: Props) {
    const { username } = await params
    const supabase = await createClient()

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
        .eq('username', username)
        .maybeSingle()

    if (!profile) {
        notFound()
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

    return (
        <main className="min-h-screen bg-hky-black text-white flex flex-col">
            <PlayerHero
                playerName={profile.full_name}
                username={profile.username}
                imageUrl={profile.photo_url || "https://ridermcc.github.io/player-hub/player-photo.jpg"}
                nationality={profile.nationality || "CA"}
                teamName={profile.current_team}
                leagueName={profile.current_league}
                socialLinks={socialLinks}
            />
            <PlayerStats
                stats={currentStats ? currentStats.stats : []}
                season={currentStats?.season}
                bio={{
                    birthYear: profile.birth_year,
                    position: profile.position,
                    shoots_catches: profile.shoots_catches,
                    height: profile.height_display,
                    weight: profile.weight_display,
                }}
            />
            {(profile.schedule_url || (profile.player_games && profile.player_games.length > 0)) && (
                <PlayerSchedule
                    playerId={profile.id}
                    scheduleUrl={profile.schedule_url}
                    games={profile.player_games || []}
                />
            )}

            {highlights.length > 0 && (
                <PlayerVideo
                    url={highlights[0].video_url}
                    title={highlights[0].title}
                />
            )}

            {journey.length > 0 && (
                <PlayerJourney
                    stops={journey.map((j: any) => ({
                        teamName: j.team_name,
                        league: j.league,
                        years: j.end_year ? `${j.start_year}–${j.end_year}` : `${j.start_year}–Present`,
                        seasons: j.end_year ? j.end_year - j.start_year : new Date().getFullYear() - j.start_year,
                        accolades: j.accolades || [],
                    }))}
                />
            )}

            {sponsors.length > 0 && (
                <PlayerSponsors
                    sponsors={sponsors.map((s: any) => ({
                        name: s.name,
                        logoUrl: s.image_url,
                        url: s.link_url,
                        description: s.description,
                    }))}
                />
            )}

            {articles.length > 0 && (
                <PlayerArticles
                    urls={articles.map((a: any) => a.article_url)}
                />
            )}
            <ProfileFooter
                agentName={topRep?.name || "Nick DiLisi"}
                agencyName={topRep?.company || "93 Hockey Services"}
            />
        </main>
    )
}
