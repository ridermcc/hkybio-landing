import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

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
        <main className="min-h-screen bg-hky-black text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center space-y-6">
                {/* Avatar placeholder */}
                <div className="w-24 h-24 mx-auto rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold text-white/40">
                    {profile.full_name?.charAt(0) || profile.username.charAt(0).toUpperCase()}
                </div>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {profile.full_name || profile.username}
                    </h1>
                    <p className="text-sm text-ice-600 mt-1">
                        hky.bio/{profile.username}
                    </p>
                    {profile.team && (
                        <p className="text-sm text-hky-muted mt-2">
                            {profile.team}{profile.league ? ` · ${profile.league}` : ''}
                        </p>
                    )}
                </div>

                {/* Content placeholder */}
                <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02]">
                    <p className="text-sm text-hky-dim">
                        Profile coming soon. This handle has been claimed.
                    </p>
                </div>
            </div>
        </main>
    )
}
