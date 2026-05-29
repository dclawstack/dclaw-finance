/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || 'http://dclaw-finance-backend:8096';

const nextConfig = {
  output: 'standalone',
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/health/:path*',
        destination: `${BACKEND_URL}/health/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
