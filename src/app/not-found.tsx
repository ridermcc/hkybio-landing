import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="min-h-screen bg-hky-black text-white flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <h1 className="text-7xl font-black text-white/10 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                    Page not found
                </h2>
                <p className="text-hky-muted text-sm mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or may have been moved.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-2.5 bg-white text-hky-black font-semibold text-sm rounded-full hover:bg-ice-100 transition-colors"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/register"
                        className="px-6 py-2.5 bg-white/[0.06] border border-white/10 text-white font-semibold text-sm rounded-full hover:bg-white/[0.1] transition-colors"
                    >
                        Claim Your Handle
                    </Link>
                </div>
            </div>
        </main>
    )
}
