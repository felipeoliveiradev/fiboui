import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(dir, '../../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['fiboui'],
  outputFileTracingRoot: repo,
  experimental: { externalDir: true },
  webpack: (config) => {
    // Do not alias `fiboui` → dist/index.js: App Router must use the react-server export.
    config.resolve.alias['fiboui/style.css'] = path.join(repo, 'dist/style.css');
    return config;
  },
};

export default nextConfig;
