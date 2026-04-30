
import type { Metadata } from 'next';
import styles from './branding.module.css';

export const metadata: Metadata = {
    title: "hky.bio — Brand Guide",
};

export default function BrandingPage() {
    return (
        <div className={styles.root}>
            <div className={styles.container}>

                {/* Header */}
                <header className={styles.header}>
                    <p className={styles.subtitle}>Brand Guide</p>
                </header>

                {/* ── Logos ── */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Logos</h2>

                    <div className={styles.logoGrid}>
                        {/* White / dark-bg */}
                        <div className={styles.logoCard}>
                            <div className={styles.logoPreview} style={{ background: '#0a0a0f' }}>
                                <img src="/logo-white.svg" alt="White logo" />
                            </div>
                            <div className={styles.logoMeta}>
                                <span className={styles.logoLabel}>White — dark backgrounds</span>
                                <div className={styles.downloadRow}>
                                    <a href="/logo-white.svg" download className={styles.dlBtn}>SVG</a>
                                    <a href="/logo-white.png" download className={styles.dlBtn}>PNG</a>
                                </div>
                            </div>
                        </div>

                        {/* Black / light-bg */}
                        <div className={styles.logoCard}>
                            <div className={styles.logoPreview} style={{ background: '#ffffff' }}>
                                <img src="/logo-black.svg" alt="Black logo" />
                            </div>
                            <div className={styles.logoMeta}>
                                <span className={styles.logoLabel}>Black — light backgrounds</span>
                                <div className={styles.downloadRow}>
                                    <a href="/logo-black.svg" download className={styles.dlBtn}>SVG</a>
                                    <a href="/logo-black.png" download className={styles.dlBtn}>PNG</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Colors ── */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Colors</h2>

                    <div className={styles.swatchGrid}>
                        <Swatch label="Ice 500" hex="#0EA5E9" />
                        <Swatch label="Ice 600" hex="#0284C7" />
                        <Swatch label="Ice 800" hex="#075985" />
                        <Swatch label="CTA Callout" hex="#0268A2" />
                    </div>

                    <h3 className={styles.subLabel}>Backgrounds</h3>
                    <div className={styles.swatchGrid}>
                        <Swatch label="Black" hex="#0A0A0F" border />
                        <Swatch label="Dark" hex="#12121A" border />
                        <Swatch label="Surface" hex="#1A1A24" border />
                    </div>

                    <h3 className={styles.subLabel}>Text</h3>
                    <div className={styles.swatchGrid}>
                        <Swatch label="Primary" hex="#FEFFFE" border />
                        <Swatch label="Muted" hex="#94A3B8" />
                        <Swatch label="Dim" hex="#64748B" />
                    </div>
                </section>

                {/* ── Gradient ── */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Gradient</h2>
                    <div className={styles.gradientCard}>
                        <div className={styles.gradientBar} />
                        <code className={styles.gradientCode}>
                            linear-gradient(135deg, #0284C7, #075985)
                        </code>
                    </div>
                </section>

                {/* ── Typography ── */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Typography</h2>

                    <div className={styles.typeCard}>
                        <div className={styles.typeRow}>
                            <span className={styles.typeLabel}>Geist Sans</span>
                            <span className={styles.typeSample}>One Link. Your Hockey Story.</span>
                        </div>
                        <div className={styles.typeRow}>
                            <span className={styles.typeLabel}>Geist Mono</span>
                            <span className={styles.typeSampleMono}>hky.bio/mccallum</span>
                        </div>
                    </div>
                </section>

                <footer className={styles.footer}>
                    &copy; 2026 MyHockeyBio.com
                </footer>
            </div>
        </div>
    );
}

/* ─── Swatch helper ─── */
function Swatch({ label, hex, border }: { label: string; hex: string; border?: boolean }) {
    return (
        <div className={styles.swatch}>
            <div
                className={styles.swatchColor}
                style={{
                    background: hex,
                    border: border ? '1px solid rgba(255,255,255,0.12)' : 'none',
                }}
            />
            <span className={styles.swatchLabel}>{label}</span>
            <code className={styles.swatchHex}>{hex}</code>
        </div>
    );
}
