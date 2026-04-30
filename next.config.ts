import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['node-ical'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'abytjsltxtckufmfezwc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};


export default nextConfig;
