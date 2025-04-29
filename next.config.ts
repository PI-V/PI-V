import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
          protocol: 'https',
          hostname: 'drive.google.com',
          port: '',
          pathname: '/uc*'
      }
    ],
  },
};

export default nextConfig;
