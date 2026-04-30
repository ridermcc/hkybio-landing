import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Bounded scan over auth.users. Caps cost at 10 pages × 100 users = 1k users,
// which is fine for launch. Replace with a dedicated profiles table or
// auth.users mirror once user count approaches the cap.
const MAX_PAGES = 10
const PER_PAGE = 100

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()
        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const normalizedEmail = email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }

        for (let page = 1; page <= MAX_PAGES; page++) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({
                page,
                perPage: PER_PAGE,
            })

            if (error) {
                return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
            }

            const users = data?.users || []
            if (users.some(u => u.email?.toLowerCase() === normalizedEmail)) {
                return NextResponse.json({ exists: true })
            }

            if (users.length < PER_PAGE) break
        }

        return NextResponse.json({ exists: false })
    } catch {
        return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
    }
}
