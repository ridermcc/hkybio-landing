import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        const { username, email } = await req.json()

        if (!username || !email) {
            return NextResponse.json({ error: 'Username and email are required' }, { status: 400 })
        }

        const normalizedUsername = username.trim().toLowerCase()
        const normalizedEmail = email.trim().toLowerCase()

        // 1. Check if username is already taken by a registered player
        const { data: existingPlayer, error: playerError } = await supabaseAdmin
            .from('players')
            .select('id')
            .eq('username', normalizedUsername)
            .maybeSingle()

        if (playerError) throw playerError
        if (existingPlayer) {
            return NextResponse.json({ error: 'This handle is already registered.' }, { status: 409 })
        }

        // 2. Check if there's an active reservation for this username by someone else
        const { data: existingRes, error: resError } = await supabaseAdmin
            .from('handle_reservations')
            .select('email, expires_at')
            .eq('username', normalizedUsername)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle()

        if (resError) throw resError

        if (existingRes && existingRes.email !== normalizedEmail) {
            return NextResponse.json({ 
                error: 'This handle is temporarily reserved by someone else.',
                reserved: true 
            }, { status: 409 })
        }

        // 3. Upsert the reservation
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes

        const { error: upsertError } = await supabaseAdmin
            .from('handle_reservations')
            .upsert({
                username: normalizedUsername,
                email: normalizedEmail,
                expires_at: expiresAt,
            }, { onConflict: 'username' })

        if (upsertError) throw upsertError

        return NextResponse.json({ 
            success: true, 
            expiresAt 
        })

    } catch (err: any) {
        console.error('Reservation API Error:', err)
        return NextResponse.json({ error: 'Failed to reserve handle.' }, { status: 500 })
    }
}
