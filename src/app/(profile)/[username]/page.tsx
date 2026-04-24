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
import { PlayerLinkItem } from '@/components/profile/PlayerLinkItem'

type Props = {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params
    
    // Safety check for reserved keywords
    const reservedKeywords = ['login', 'register', 'dashboard', 'api', 'forgot-password', 'reset-password'];
    if (reservedKeywords.includes(username.toLowerCase())) {
        return { title: 'Not Found | hky.bio' };
    }

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
    
    // Safety check for reserved keywords
    const reservedKeywords = ['login', 'register', 'dashboard', 'api', 'forgot-password', 'reset-password'];
    if (reservedKeywords.includes(username.toLowerCase())) {
        notFound();
    }

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

    const linkItems: { id: string, size: 'standard' | 'compact', link: any }[] = [];
    let sponsorIndex = 0;
    
    function inferSections() {
        const sections: string[] = []
        if (playerStatsList.length > 0) sections.push('stats')
        if (profile.schedule_url || (profile.player_games && profile.player_games.length > 0)) sections.push('schedule')
        if (highlights.length > 0) sections.push('video')
        if (journey.length > 0) sections.push('journey')
        if (sponsors.length > 0) sections.push('sponsors')
        if (articles.length > 0) sections.push('articles')
        return sections
    }

    const rawSections = (profile.section_order as string[] | null) || inferSections()
    const newSections = []
    const disabledSections = (profile.disabled_sections as string[] | null) || []

    for (const section of rawSections) {
        if (section === 'footer' || disabledSections.includes(section)) continue;

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
        } else if (section !== 'hero') {
            newSections.push(section)
        }
    }

    const renderSection = (section: string) => {
        if (section === 'stats' && currentStats) {
            return <PlayerStats key="stats" stats={currentStats.stats} season={currentStats.season} bio={{
                birthYear: profile.birth_year,
                position: profile.position,
                shoots_catches: profile.shoots_catches,
                height: profile.height_display,
                weight: profile.weight_display,
            }} />
        }
        if (section === 'schedule' && (profile.schedule_url || profile.player_games?.length > 0)) {
            return <PlayerSchedule key="schedule" playerId={profile.id} scheduleUrl={profile.schedule_url} games={profile.player_games || []} />
        }
        if (section === 'video' && highlights.length > 0) {
            return <PlayerVideo key="video" url={highlights[0].video_url} title={highlights[0].title} />
        }
        if (section === 'journey' && journey.length > 0) {
            return <PlayerJourney key="journey" stops={journey.map((j: any) => ({
                teamName: j.team_name,
                league: j.league,
                years: j.end_year ? `${j.start_year}–${j.end_year}` : `${j.start_year}–Present`,
                seasons: j.end_year ? j.end_year - j.start_year : new Date().getFullYear() - j.start_year,
                accolades: j.accolades || [],
            }))} />
        }
        if (section === 'articles' && articles.length > 0) {
            return <PlayerArticles key="articles" urls={articles.map((a: any) => a.article_url)} />
        }
        
        // Link item
        const item = linkItems.find(b => b.id === section)
        if (item) {
            return <PlayerLinkItem key={item.id} size={item.size} link={item.link} />
        }
        
        return null;
    }

    return (
        <main className="min-h-screen bg-hky-black text-white flex flex-col items-center">
            <div className="w-full max-w-3xl pb-8">
                <PlayerHero
                    playerName={profile.full_name}
                    username={profile.username}
                    imageUrl={profile.photo_url || "/default-player.png"}
                    nationality={profile.nationality || "CA"}
                    teamName={profile.current_team}
                    leagueName={profile.current_league}
                    bio={profile.bio}
                    socialLinks={socialLinks}
                />
                
                {/* Dynamically sorted inner sections */}
                <div className="flex flex-col">
                    {newSections.map(renderSection)}
                </div>

                <ProfileFooter
                    mode={topRep ? 'represented' : 'player'}
                    playerName={profile.full_name}
                    teamName={profile.current_team}
                    leagueName={profile.current_league}
                    agentName={topRep?.name}
                    agencyName={topRep?.company}
                />
            </div>
        </main>
    )
}
