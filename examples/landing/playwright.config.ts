import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4176',
    screenshot: 'off',
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'npx vite preview --host 127.0.0.1 --port 4176',
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
