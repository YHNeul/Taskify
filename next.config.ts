import type { NextConfig } from 'next';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://sp-taskify-api.vercel.app/22-2/';
const apiHostname = (() => {
  try {
    return new URL(apiUrl).hostname;
  } catch {
    return 'sp-taskify-api.vercel.app';
  }
})();

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: apiHostname,
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
