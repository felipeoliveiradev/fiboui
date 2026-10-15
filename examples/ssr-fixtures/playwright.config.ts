import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  use: {
    screenshot: 'off',
    viewport: { width: 1024, height: 768 },
  },
  webServer: [
    {
      command: 'npm run start:vite',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run build:next && npm run start:next',
      url: 'http://127.0.0.1:3015',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
