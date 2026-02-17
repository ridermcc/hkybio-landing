export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-hky-black text-white flex items-center justify-center">
            {children}
        </main>
    );
}
