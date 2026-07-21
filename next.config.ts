import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'mc-heads.net' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [64, 128, 256, 384, 640],
    imageSizes: [16, 32, 48, 64, 96, 128],
    minimumCacheTTL: 3600,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
