/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from any domain during development
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable static exports if needed
  output: 'standalone',
  // Ensure compatibility with Cloudflare Workers
  experimental: {
    // serverMinification is not needed for Cloudflare
    serverMinification: false,
  },
}

module.exports = nextConfig
