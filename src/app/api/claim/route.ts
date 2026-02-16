import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { render } from '@react-email/render';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, ...data } = body;

        // 1. Initial Email Submission
        if (action === 'create') {
            const { email } = data;

            // Check if email already exists
            const { data: existing } = await supabaseAdmin
                .from('waitlist')
                .select('email')
                .eq('email', email)
                .maybeSingle();

            if (existing) {
                return NextResponse.json(
                    { error: 'This email is already on the waitlist!' },
                    { status: 409 }
                );
            }

            const { error } = await supabaseAdmin
                .from('waitlist')
                .insert([{ email, source: 'claim' }]);

            if (error) throw error;

            if (error) throw error;

            // Sync with Resend Audience
            try {
                const audienceId = process.env.RESEND_WAITLIST_AUDIENCE_ID;
                if (audienceId) {
                    await resend.contacts.create({
                        email: email,
                        unsubscribed: false,
                        audienceId: audienceId,
                    });
                }
            } catch (resendError) {
                console.error('Failed to sync with Resend audience:', resendError);
                // Non-blocking error, user is still in DB
            }

            return NextResponse.json({ success: true });
        }

        // 2. Final Submission (Update)
        if (action === 'update') {
            const { email, username, full_name, team, league } = data;

            // Check username availability again (race condition protection)
            const { data: existingUsername } = await supabaseAdmin
                .from('waitlist')
                .select('id')
                .eq('username', username)
                .neq('email', email) // exclude self if they already claimed it (unlikely but safe)
                .maybeSingle();

            if (existingUsername) {
                return NextResponse.json(
                    { error: `hky.bio/${username} was just claimed! Please try another.` },
                    { status: 409 }
                );
            }

            const { error } = await supabaseAdmin
                .from('waitlist')
                .update({
                    username,
                    full_name,
                    team,
                    league,
                })
                .eq('email', email);

            if (error) throw error;

            const firstName = full_name.split(' ')[0];

            try {
                // Explicitly render the email template to avoid implicit React rendering issues
                const html = await render(WelcomeEmail({ firstName, username }));

                await resend.emails.send({
                    from: 'Rider <rider@hky.bio>',
                    to: [email],
                    subject: `Handle reserved: hky.bio/${username}`,
                    html: html,
                    headers: {
                        'List-Unsubscribe': '<{{{resend_unsubscribe_url}}}>',
                    },
                });
            } catch (emailErr) {
                console.error('Email failed to send:', emailErr);
                // We don't throw here so the user still sees success in the UI
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (err: any) {
        console.error('API Error:', err);
        // Return generic error to client
        return NextResponse.json(
            { error: err.message || 'Something went wrong' },
            { status: 500 }
        );
    }
}
