/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Optional: Add a trailing slash to all paths
  trailingSlash: true,
};

module.exports = nextConfig;
