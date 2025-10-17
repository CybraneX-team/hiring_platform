import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 ye line add kar — this enables standalone mode for Docker
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hiring-platform-bucket.s3.ap-south-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
