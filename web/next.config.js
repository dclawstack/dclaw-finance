/** @type {import('next').NextConfig} */
const nextConfig = {
  // API calls proxied through Next.js rewrites so the browser never
  // needs to know the backend URL — only the server does.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8096";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
