/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  staticPageGenerationTimeout: 0,
  experimental: {
    isrMemoryCacheSize: 0,
  },
};

module.exports = nextConfig;
