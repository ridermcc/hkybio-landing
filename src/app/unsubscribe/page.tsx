export default async function UnsubscribePage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string; resubscribed?: string; email?: string; token?: string }>;
}) {
    const params = await searchParams;
    const success = params.success === 'true';
    const resubscribed = params.resubscribed === 'true';
    const error = params.error;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hky.bio';
    const resubscribeUrl = params.email && params.token
        ? `${baseUrl}/api/resubscribe?email=${encodeURIComponent(params.email)}&token=${params.token}`
        : null;

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                {resubscribed ? (
                    <>
                        <h1 style={headingStyle}>Welcome back!</h1>
                        <p style={textStyle}>
                            You&apos;ve been re-subscribed and will receive emails from hky.bio again.
                        </p>
                    </>
                ) : success ? (
                    <>
                        <h1 style={headingStyle}>You&apos;ve been unsubscribed</h1>
                        <p style={textStyle}>
                            You won&apos;t receive further emails from hky.bio.
                            {resubscribeUrl ? (
                                <>
                                    {' '}If this was a mistake,{' '}
                                    <a href={resubscribeUrl} style={linkStyle}>click here to resubscribe</a>.
                                </>
                            ) : null}
                        </p>
                    </>
                ) : error ? (
                    <>
                        <h1 style={headingStyle}>Something went wrong</h1>
                        <p style={textStyle}>
                            {error === 'invalid' || error === 'missing'
                                ? 'This unsubscribe link is invalid or has expired.'
                                : 'An unexpected error occurred. Please try again later.'}
                        </p>
                    </>
                ) : (
                    <>
                        <h1 style={headingStyle}>Unsubscribe</h1>
                        <p style={textStyle}>
                            Use the link in your email to unsubscribe.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

const pageStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#000',
    padding: '20px',
};

const cardStyle: React.CSSProperties = {
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    padding: '48px 32px',
    border: '1px solid #222',
    borderRadius: '12px',
    backgroundColor: '#0a0a0a',
};

const headingStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
};

const textStyle: React.CSSProperties = {
    fontSize: '16px',
    lineHeight: 1.6,
    color: '#9ca3af',
    fontFamily: 'system-ui, -apple-system, sans-serif',
};

const linkStyle: React.CSSProperties = {
    color: '#fff',
    textDecoration: 'underline',
};
