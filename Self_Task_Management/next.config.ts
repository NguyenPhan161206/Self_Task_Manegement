import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Add remote image hostnames here when you want to use external images in data/home.json
      // (e.g. for hero, testimonials, etc.). Currently using only local images in /public/images/.
      // Example:
      // {
      //   protocol: 'https',
      //   hostname: 'picsum.photos',
      // },
    ],
  },
}

export default nextConfig
