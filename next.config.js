/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export
  output: 'export',
  
  // Configure images to work with static export
  images: {
    unoptimized: true
  },
  
  // Set the output directory for the static export
  distDir: 'out',
  
  // Enable trailing slashes for all paths
  trailingSlash: true,
  
  // Optional: Add basePath if your site is hosted in a subdirectory
  // basePath: '/your-repo-name',
  
  // Optional: Configure the export path map
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/404': { page: '/404' }
    };
  }
};

module.exports = nextConfig;
