// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⛔ ignores ESLint errors
  },
};

module.exports = nextConfig;
