import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
  },
};

export default nextConfig;
