import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable strict mode for better React hygiene
  reactStrictMode: true,

  // Transpile the local design package so CSS imports resolve
  transpilePackages: ['@tally/design'],

  // Image domains for Google avatars (OAuth profile pictures)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  // Forward /api/v1/* requests to the FastAPI backend during development
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
