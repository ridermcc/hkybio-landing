import { NextRequest, NextResponse } from 'next/server';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resend } from '@/lib/resend';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hky.bio';

    // Validate params
    if (!email || !token) {
        return NextResponse.redirect(`${baseUrl}/unsubscribe?error=missing`);
    }

    // Verify the HMAC token
    if (!verifyUnsubscribeToken(email, token)) {
        return NextResponse.redirect(`${baseUrl}/unsubscribe?error=invalid`);
    }

    try {
        // 1. Update Supabase — mark as unsubscribed
        await supabaseAdmin
            .from('waitlist')
            .update({ status: 'unsubscribed' })
            .eq('email', email);

        // 2. Update Resend Audience — mark contact as unsubscribed
        const audienceId = process.env.RESEND_WAITLIST_AUDIENCE_ID;
        if (audienceId) {
            try {
                // Find the contact first
                const { data: contacts } = await resend.contacts.list({ audienceId });
                const contact = contacts?.data?.find(
                    (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
                );

                if (contact) {
                    await resend.contacts.update({
                        id: contact.id,
                        audienceId,
                        unsubscribed: true,
                    });
                }
            } catch (resendErr) {
                console.error('Failed to update Resend contact:', resendErr);
                // Non-blocking — Supabase is the source of truth
            }
        }

        return NextResponse.redirect(`${baseUrl}/unsubscribe?success=true&email=${encodeURIComponent(email)}&token=${token}`);
    } catch (err) {
        console.error('Unsubscribe error:', err);
        return NextResponse.redirect(`${baseUrl}/unsubscribe?error=server`);
    }
}
