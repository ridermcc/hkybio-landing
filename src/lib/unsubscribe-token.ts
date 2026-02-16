import { createHmac } from 'crypto';

const SECRET = process.env.UNSUBSCRIBE_SECRET!;

/**
 * Generate an HMAC-SHA256 token for an email address.
 * This token is used in unsubscribe links so users can't
 * unsubscribe others by guessing their email.
 */
export function generateUnsubscribeToken(email: string): string {
    return createHmac('sha256', SECRET).update(email.toLowerCase()).digest('hex');
}

/**
 * Verify that a token matches the expected HMAC for the given email.
 */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
    const expected = generateUnsubscribeToken(email);
    return expected === token;
}

/**
 * Build a full unsubscribe URL for use in emails.
 */
export function buildUnsubscribeUrl(email: string): string {
    const token = generateUnsubscribeToken(email);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hky.bio';
    return `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
