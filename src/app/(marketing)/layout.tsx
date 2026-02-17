import TopNav from '@/components/marketing/TopNav';
import Footer from '@/components/marketing/Footer';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-hky-black text-white relative overflow-x-hidden">
            {/* Background ice glow effects */}
            <div className="ice-glow -top-40 -right-40" />
            <div className="ice-glow -bottom-40 -left-40" />

            <TopNav />
            {children}
            <Footer />
        </main>
    );
}
