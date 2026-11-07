import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 480, 640, 768, 1024, 1280],
  },
  async redirects() {
    return [
      {
        source: '/marketplace',
        destination: 'https://marketplace.orizzoncart.com.ng',
        permanent: true,
      },
      {
        source: '/marketplace/:path*',
        destination: 'https://marketplace.orizzoncart.com.ng/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
