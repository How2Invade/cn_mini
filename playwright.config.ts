import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop 1920x1080',
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'Laptop 1366x768',
      use: { viewport: { width: 1366, height: 768 } },
    },
    {
      name: 'Mobile 390x844',
      use: { viewport: { width: 390, height: 844 } },
    },
  ],
});
