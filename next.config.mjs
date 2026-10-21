// Static export for GitHub Pages. The deploy workflow sets NEXT_PUBLIC_BASE_PATH
// to "/<repo-name>" for project sites, or "" for a <username>.github.io repo.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
