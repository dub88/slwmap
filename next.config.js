/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable image optimization API route for static export
  experimental: {
    images: {
      unoptimized: true
    }
  },
  // Add basePath if your site is hosted in a subdirectory
  // basePath: '/your-repo-name',
  // Ensure trailing slashes for all paths
  trailingSlash: true,
  // Disable server-side rendering for all pages
  generateBuildId: async () => 'build',
  // This will create a 404.html file for GitHub Pages
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/404': { page: '/404' }
    };
  }
};

module.exports = nextConfig;
