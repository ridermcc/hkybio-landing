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
import { PlayerBusiness } from '@/components/profile/PlayerBusiness'

type Props = {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('waitlist')
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
        .from('waitlist')
        .select('username, full_name, team, league')
        .eq('username', username)
        .maybeSingle()

    if (!profile) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-hky-black text-white flex flex-col">
            <PlayerHero
                playerName={profile.full_name}
                username={profile.username}
                imageUrl="https://ridermcc.github.io/player-hub/player-photo.jpg"
                nationality="CA"
                teamName={profile.team}
                leagueName={profile.league}
            />
            <PlayerStats
                stats={{
                    GP: 24,
                    G: 1,
                    A: 17,
                    PTS: 18,
                }}
                season="2024-25"
                league={profile.league ?? undefined}
                bio={{
                    birthYear: 2001,
                    position: 'D',
                    shoots: 'L',
                    height: '6\'0',
                    weight: '175',
                }}
            />
            <PlayerSchedule
                scheduleUrl="https://athletics.aurora.edu/sports/mens-ice-hockey/schedule"
            />

            <PlayerVideo
                url="https://www.youtube.com/embed/SWHWiAAV5qs"
            />

            <PlayerJourney
                stops={[
                    {
                        teamName: 'Revelstoke Grizzlies',
                        league: 'KIJHL',
                        years: '2018–2020',
                        seasons: 2,
                        accolades: ['KIJHL Champion', 'Cyclone Taylor Cup Champion'],
                    },
                    {
                        teamName: 'Fort McMurray Oil Barons',
                        league: 'AJHL',
                        years: '2020–2022',
                        seasons: 2,
                        accolades: ['Rody McNeil Community Award'],
                    },
                    {
                        teamName: 'Plymouth State University',
                        league: 'NCAA III',
                        years: '2022–2026',
                        seasons: 4,
                        accolades: ['2x MASCAC Champion', '3x First Team All-Conference'],
                    },
                ]}
            />
            <PlayerBusiness
                businesses={[
                    {
                        name: 'hky.bio',
                        tagline: 'Personal branding for hockey players',
                        url: 'https://www.hky.bio',
                        coverUrl: 'https://hky.bio/logo-white.svg',
                    },
                ]}
            />
            <PlayerSponsors
                sponsors={[
                    { name: 'Bauer', logoUrl: 'https://imgs.search.brave.com/_hlXsxAP6dHvq6a4bfizjN-7Hii2d0WKkGIyEfHz8lc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wNy5o/aWNsaXBhcnQuY29t/L3ByZXZpZXcvNTE5/LzgzNy8yOTgvYmF1/ZXItaG9ja2V5LWlj/ZS1ob2NrZXktZXF1/aXBtZW50LWhvY2tl/eS1zdGlja3MtbG9n/by1zcG9ydC1ob2Nr/ZXkuanBn', url: 'https://www.bauer.com', description: 'My go-to gear since bantam', discount: '15% Off', promoCode: 'RIDER15' },
                    { name: 'CCM', logoUrl: 'https://imgs.search.brave.com/oPBrt4S2o33WKJ20R_7KXrTBSkD8ikeiV3o5bHNS424/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuc2Vla2xvZ28u/Y29tL2xvZ28tcG5n/LzQ5LzEvY2NtLWxv/Z28tcG5nX3NlZWts/b2dvLTQ5NjI5MS5w/bmc', url: 'https://www.ccmhockey.com', description: 'Best helmet in the game', promoCode: 'MCCALLUM10' },
                ]}
            />
            <PlayerArticles
                urls={[
                    'https://www.kijhl.ca/grizzlies-alumnus-mccallum-earns-ncaa-iii-rookie-nod',
                    'https://athletics.plymouth.edu/news/2025/10/17/mens-ice-hockey-mh-panthers-favored-in-inaugural-lec-mens-ice-hockey-season.aspx',
                    'https://athletics.plymouth.edu/news/2024/12/7/mens-ice-hockey-mh-mccallum-pots-ot-game-winner-in-annual-teddy-bear-toss-game.aspx',
                    'https://www.ajhl.ca/rider-mccallum-commits-to-plymouth-state-university',
                    'https://athletics.plymouth.edu/news/2024/3/28/mens-ice-hockey-10-mh-four-panthers-chosen-as-new-england-all-stars-by-nehwa.aspx',
                    'https://www.instagram.com/p/C5ETRkDs_6Z/',
                    'https://athletics.plymouth.edu/news/2024/3/9/mens-ice-hockey-9-mh-tait-lifts-panthers-past-cortland-in-ncaa-tournament.aspx',
                    'https://www.kijhl.ca/grizzlies-headed-to-junior-a-college-level',
                ]}
            />
            <ProfileFooter
                agentName="Nick DiLisi"
                agencyName="93 Hockey Services"
            />
        </main>
    )
}
