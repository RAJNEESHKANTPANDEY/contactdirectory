/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
};

module.exports = nextConfig;
