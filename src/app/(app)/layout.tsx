import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <main className="min-h-screen bg-hky-black text-white">
            {/* App shell — you'll add your dashboard nav/sidebar here later */}
            {children}
        </main>
    );
}
