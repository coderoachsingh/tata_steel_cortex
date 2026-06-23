import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // When the browser securely asks for this path...
        source: '/api/auth/:path*',
        // ...Next.js secretly forwards it to your Fargate IP!
        destination: 'http://43.205.243.221:4000/api/auth/:path*' 
      }
    ]
  }
};

export default nextConfig;