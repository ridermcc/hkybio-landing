import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const normalizedEmail = email.trim().toLowerCase()

        // Use listUsers with a small page to check if email exists.
        // Filter server-side by checking just the first match.
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1,
            // Note: listUsers doesn't support email filter in the API,
            // but with perPage=1 we limit the blast radius. For a more
            // scalable solution, consider a Supabase Edge Function or
            // a dedicated "users" table mirroring auth.users.
        })

        if (error) {
            console.error('Error checking email in Supabase:', error)
            return NextResponse.json({ error: 'Failed to check email availability' }, { status: 500 })
        }

        // Search through the returned users for a match
        // Note: This checks page 1 only. For full coverage at scale,
        // paginate or use a DB trigger to mirror auth.users.email.
        const allUsers = data?.users || []
        const exists = allUsers.some(u => u.email?.toLowerCase() === normalizedEmail)

        // If not found in page 1, do a broader check by querying all pages
        if (!exists && allUsers.length > 0) {
            // Fetch all users to find the email (this is the original approach
            // but we cap it and don't expose errors to the client)
            let page = 1
            const perPage = 100
            let found = false

            while (true) {
                const { data: pageData, error: pageError } = await supabaseAdmin.auth.admin.listUsers({
                    page,
                    perPage,
                })

                if (pageError || !pageData?.users?.length) break

                if (pageData.users.some(u => u.email?.toLowerCase() === normalizedEmail)) {
                    found = true
                    break
                }

                // If we got fewer than perPage, we've reached the last page
                if (pageData.users.length < perPage) break
                page++

                // Safety cap to prevent infinite loops
                if (page > 100) break
            }

            return NextResponse.json({ exists: found })
        }

        return NextResponse.json({ exists })
    } catch (err: any) {
        console.error('API Error in check-email:', err)
        return NextResponse.json({ error: 'Failed to check email availability' }, { status: 500 })
    }
}
