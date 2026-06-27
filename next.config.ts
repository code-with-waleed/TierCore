import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    domains: ['cdn.discordapp.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [64, 128, 256],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
