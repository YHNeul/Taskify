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
const imageHostnames = Array.from(
  new Set([
    apiHostname,
    'sprint-fe-project.s3.ap-northeast-2.amazonaws.com',
    ...(process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES ?? '')
      .split(',')
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  ]),
);

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [58, 70, 72, 75, 86],
    deviceSizes: [256, 320, 384, 445, 560, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 24, 26, 32, 38, 48, 64, 96, 128, 160, 192, 256],
    remotePatterns: [
      ...imageHostnames.map((hostname) => ({
        protocol: 'https' as const,
        hostname,
      })),
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
