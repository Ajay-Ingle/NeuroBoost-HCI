import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  async rewrites() {
    // Only use the local proxy if we are in development mode
    return process.env.NODE_ENV === 'development' ? [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ] : [];
  },
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
