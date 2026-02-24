import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { PlayerHero } from '@/components/profile/PlayerHero'

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
                birthYear={2001}
                position="D"
                nationality="CA"
                teamName={profile.team}
                leagueName={profile.league}
            />
        </main>
    )
}
