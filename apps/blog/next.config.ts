import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  // API backend URL for data fetching
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
  },

  // Image optimization
  images: {
    remotePatterns: [
      { hostname: 'github.com' },
      { hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // Experimental features
  experimental: {
    // Enable PPR for better performance
    ppr: false,
  },
};

export default nextConfig;
