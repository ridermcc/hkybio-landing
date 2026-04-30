import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const USERNAME_REGEX = /^[a-z0-9._]+$/

export async function POST(req: NextRequest) {
    try {
        const { username, email } = await req.json()

        if (!username || typeof username !== 'string') {
            return NextResponse.json({ error: 'username required' }, { status: 400 })
        }

        const normalizedUsername = username.trim().toLowerCase()
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : null

        if (!USERNAME_REGEX.test(normalizedUsername) || normalizedUsername.length < 3 || normalizedUsername.length > 15) {
            return NextResponse.json({ available: false, error: 'invalid' }, { status: 400 })
        }

        const { data: existingPlayer } = await supabaseAdmin
            .from('players')
            .select('id')
            .eq('username', normalizedUsername)
            .maybeSingle()

        if (existingPlayer) {
            return NextResponse.json({ available: false })
        }

        const { data: reservation } = await supabaseAdmin
            .from('handle_reservations')
            .select('email, expires_at')
            .eq('username', normalizedUsername)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle()

        if (reservation && reservation.email !== normalizedEmail) {
            return NextResponse.json({ available: false })
        }

        return NextResponse.json({ available: true })
    } catch {
        return NextResponse.json({ error: 'Failed to check username' }, { status: 500 })
    }
}
