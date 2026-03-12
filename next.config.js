/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'tramites-secret-key-2024',
  },
}

module.exports = nextConfig
