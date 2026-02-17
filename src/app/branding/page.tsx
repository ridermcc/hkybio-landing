
import type { Metadata } from 'next';
import styles from './branding.module.css';

export const metadata: Metadata = {
    title: "MyHockeyBio Brand Bible",
};

export default function BrandingPage() {
    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={`${styles.h1} ${styles.textGradient}`}>Brand Bible</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--hky-muted)' }}>The Identity System for <span style={{ color: 'white', fontWeight: 600 }}>hky.bio</span></p>
                </header>

                <section>
                    <h2 className={styles.h2}>Logo Marks</h2>
                    <div className={styles.grid}>
                        <div>
                            <div className={styles.logoBox} style={{ background: 'var(--hky-dark)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <img src="/logo-white.png" alt="Primary Logo" />
                            </div>
                            <h3 className={styles.h3} style={{ marginTop: '15px' }}>White Logo</h3>
                            <p className={styles.muted}>Primary asset for dark backgrounds.</p>
                            <a href="/logo-white.png" download className={styles.downloadBtn}>Download PNG</a>
                        </div>
                        <div>
                            <div className={styles.logoBox} style={{ background: '#ffffff' }}>
                                <img src="/logo-black.png" alt="Secondary Logo" />
                            </div>
                            <h3 className={styles.h3} style={{ marginTop: '15px' }}>Black Logo</h3>
                            <p className={styles.muted}>Used for light-mode icons.</p>
                            <a href="/logo-black.png" download className={styles.downloadBtn}>Download PNG</a>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className={styles.h2}>Signature Gradient</h2>
                    <div className={styles.card}>
                        <div className={styles.gradientPreview}></div>
                        <h3 className={styles.h3}>Primary "For Hockey" Gradient</h3>
                        <p>The core accent for high-impact headlines and primary text highlights.</p>
                        <ul className={styles.muted}>
                            <li><strong>Start Color:</strong> <code className={styles.code}>#0284c7</code> (Ice-600)</li>
                            <li><strong>End Color:</strong> <code className={styles.code}>#075985</code> (Ice-800)</li>
                            <li><strong>Angle:</strong> 135deg</li>
                        </ul>
                        <p><strong>Tailwind Class:</strong> <code className={styles.code}>.text-gradient</code></p>
                    </div>
                </section>

                <section>
                    <h2 className={styles.h2}>Core Palette</h2>
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <h3 className={styles.h3} style={{ color: '#FEFFFE' }}>Primary Text</h3>
                            <p className={styles.muted}>Main body text color.</p>
                            <code className={styles.code}>#FEFFFE</code>
                        </div>
                        <div className={styles.card}>
                            <h3 className={styles.h3} style={{ color: '#94a3b8' }}>Muted Text</h3>
                            <p className={styles.muted}>Secondary labels and hints.</p>
                            <code className={styles.code}>#94A3B8</code>
                        </div>
                        <div className={styles.card}>
                            <h3 className={styles.h3} style={{ color: '#0268A2' }}>CTA Callout</h3>
                            <p className={styles.muted}>High-priority action text.</p>
                            <code className={styles.code}>#0268A2</code>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className={styles.h2}>Background System</h2>
                    <div className={styles.grid}>
                        <div className={styles.card} style={{ background: '#0a0a0f' }}>
                            <h3 className={styles.h3}>Hky Black</h3>
                            <p className={styles.muted}>Global background color.</p>
                            <code className={styles.code}>#0A0A0F</code>
                        </div>
                        <div className={styles.card} style={{ background: '#1a1a24' }}>
                            <h3 className={styles.h3}>Hky Surface</h3>
                            <p className={styles.muted}>Input fields and container backgrounds.</p>
                            <code className={styles.code}>#1A1A24</code>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className={styles.h2}>Typography</h2>
                    <div className={styles.card}>
                        <div style={{ marginBottom: '30px' }}>
                            <p className={styles.muted} style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>Main: Geist Sans</p>
                            <div className={styles.fontPreviewMain}>One Link. Your Hockey Story.</div>
                        </div>
                        <div>
                            <p className={styles.muted} style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>Mono: Geist Mono</p>
                            <div className={styles.fontPreviewMono} style={{ fontSize: '1.5rem', marginTop: "10px" }}>hky.bio/mccallum</div>
                        </div>
                    </div>
                </section>

                <footer className={styles.footer}>
                    &copy; 2026 MyHockeyBio.com | Internal Document
                </footer>
            </div>
        </div>
    );
}
