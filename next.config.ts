import type { NextConfig } from 'next';

const isGitHubPagesBuild = process.env.GITHUB_PAGES === 'true';
const pagesBasePath = process.env.PAGES_BASE_PATH ?? '';

if (pagesBasePath && !pagesBasePath.startsWith('/')) {
  throw new Error('PAGES_BASE_PATH must start with /.');
}

const nextConfig: NextConfig = isGitHubPagesBuild
  ? {
      output: 'export',
      basePath: pagesBasePath,
      trailingSlash: true,
      images: { unoptimized: true },
      typescript: { tsconfigPath: 'tsconfig.pages.json' },
    }
  : {};

export default nextConfig;
