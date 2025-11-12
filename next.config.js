/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove static export as it's incompatible with server features like cookies
  // output: 'export', // Remove this if it exists
  images: {
    domains: [],
    // Only use unoptimized for static export, remove for regular deployment
    // unoptimized: true,
  },
}

module.exports = nextConfig