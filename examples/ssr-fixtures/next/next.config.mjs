import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(dir, '../../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['fiboui'],
  experimental: { externalDir: true },
  webpack: (config) => {
    config.resolve.alias.fiboui = path.join(repo, 'dist/index.js');
    config.resolve.alias['fiboui/style.css'] = path.join(repo, 'dist/style.css');
    return config;
  },
};

export default nextConfig;
