import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Increase to the desired limit (e.g., '2mb', '5mb', etc.)
    },
  },
};

export default nextConfig;
