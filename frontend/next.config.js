// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // This is essential for standalone builds
  // Remove the entire webpack block for now, as it's not suppressing this error
  // webpack: (config, { isServer }) => { ... }
};

module.exports = nextConfig;
