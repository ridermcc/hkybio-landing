import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  title: "hky.bio | Your Hockey Story. One Link.",
  metadataBase: new URL('https://hky.bio'),
  description: "The all-in-one link for elite hockey players. Share your stats, highlights, and journey with scouts, coaches, and fans. Join the 2026 waitlist.",
  keywords: ["hockey", "linktree", "hockey player", "athlete profile", "scouts", "recruiting", "hockey stats"],
  authors: [{ name: "hky.bio" }],

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hky.bio",
    siteName: "hky.bio",
    title: "hky.bio | Your Hockey Story. One Link.",
    description: "The all-in-one link for elite hockey players. Join 500+ players on the 2026 waitlist.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "hky.bio - Your Hockey Story. One Link.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "hky.bio | Your Hockey Story. One Link.",
    description: "The all-in-one link for elite hockey players. Join the 2026 waitlist.",
    images: ["/og-image.png"],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "hky.bio",
  },

  icons: {
    icon: "/logo-black.svg",
    apple: "/logo-black.svg",
  },
};

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
        {children}
      </body>
    </html>
  );
}
