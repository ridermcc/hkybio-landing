import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="px-5 py-8 text-center border-t border-white/10" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom, 32px))' }}>
            <div className="flex flex-col items-center gap-4">
                <p className="text-xs text-hky-dim">
                    © 2026 hky.bio · Built for players, by players.
                </p>
                <div className="flex gap-4 text-[10px] text-hky-dim/60">
                    <Link href="/privacy" className="hover:text-hky-muted transition-colors">
                        Privacy Notice
                    </Link>
                    <Link href="/terms" className="hover:text-hky-muted transition-colors">
                        Terms & Conditions
                    </Link>
                </div>
            </div>
        </footer>
    );
}
