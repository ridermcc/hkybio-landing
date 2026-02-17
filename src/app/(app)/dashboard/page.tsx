import { createClient } from '@/lib/supabase/server'

export const metadata = {
    title: 'Dashboard | hky.bio',
    description: 'Manage your hky.bio profile.',
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch the user's claimed username from the waitlist table
    const { data: profile } = await supabase
        .from('waitlist')
        .select('username, full_name, team, league')
        .eq('email', user?.email)
        .maybeSingle()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-hky-muted mt-1">
                        {profile?.username
                            ? <>Editing <span className="text-ice-600">hky.bio/{profile.username}</span></>
                            : 'Welcome to hky.bio'}
                    </p>
                </div>
                <form action="/api/auth/signout" method="POST">
                    <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-medium text-hky-muted hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                    >
                        Sign out
                    </button>
                </form>
            </div>

            {/* Profile preview card — placeholder for your editor */}
            <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02]">
                <div className="text-center space-y-4">
                    {/* Avatar placeholder */}
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold text-white/40">
                        {profile?.full_name?.charAt(0) || '?'}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold">
                            {profile?.full_name || 'Your Name'}
                        </h2>
                        {profile?.team && (
                            <p className="text-sm text-hky-muted mt-1">
                                {profile.team}{profile.league ? ` · ${profile.league}` : ''}
                            </p>
                        )}
                    </div>

                    <p className="text-xs text-hky-dim border-t border-white/10 pt-4 mt-4">
                        This is where you&apos;ll build your public profile. Content editing coming soon.
                    </p>
                </div>
            </div>
        </div>
    )
}
