/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_NAME: "GrowthEngine",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com",
  },
};

module.exports = nextConfig;
