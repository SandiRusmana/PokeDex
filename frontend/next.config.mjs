/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
    ],
  },
  // Proxy API requests to Laravel backend to avoid CORS issues
  // (backend doesn't have CORS middleware configured)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://bubbly-stillness-production-5cb4.up.railway.app/api/:path*",
      },
    ];
  },
};


export default nextConfig;
