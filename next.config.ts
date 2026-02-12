import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rapid-lab-pro.cdn.express',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
