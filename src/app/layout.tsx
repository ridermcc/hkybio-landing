import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from '@/components/TopNav';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents zoom on iOS form focus
  viewportFit: "cover", // Enables env(safe-area-inset-*) for notch/Dynamic Island
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  title: "hky.bio | Your game. Your link. Claim it.",
  metadataBase: new URL('https://hky.bio'),
  description: "The all-in-one link for elite hockey players. Share your stats, highlights, and journey with scouts, coaches, and fans. Join the 2026 waitlist.",
  keywords: ["hockey", "linktree", "hockey player", "athlete profile", "scouts", "recruiting", "hockey stats"],
  authors: [{ name: "hky.bio" }],

  // Open Graph (for Instagram, Facebook, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hky.bio",
    siteName: "hky.bio",
    title: "hky.bio | Your game. Your link. Claim it.",
    description: "The all-in-one link for elite hockey players. Join 500+ players on the 2026 waitlist.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "hky.bio - Your game. Your link. Claim it.",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "hky.bio | Your game. Your link. Claim it.",
    description: "The all-in-one link for elite hockey players. Join the 2026 waitlist.",
    images: ["/og-image.png"],
  },

  // Apple specific
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "hky.bio",
  },

  // Icons
  icons: {
    icon: "/logo-black.svg",
    apple: "/logo-black.svg",
  },
};

import Footer from '@/components/Footer';

// ... (keep imports and metadata)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main className="min-h-screen bg-hky-black text-white relative overflow-x-hidden">
          {/* Background ice glow effects */}
          <div className="ice-glow -top-40 -right-40" />
          <div className="ice-glow -bottom-40 -left-40" />

          <TopNav />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
