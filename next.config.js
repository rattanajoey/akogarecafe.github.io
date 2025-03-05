/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // For static site generation
  images: {
    unoptimized: true, // For static export
  },
  // Ensure the basePath is set correctly for your deployment
  // basePath: '',
};

module.exports = nextConfig; 