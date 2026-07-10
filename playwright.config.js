// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // the demo server keeps state in memory
  fullyParallel: false,
  reporter: [['list'], ['json', { outputFile: 'reports/playwright-results.json' }]],
  use: { baseURL: 'http://localhost:3100', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined } }
    }
  ],
  webServer: { command: 'PORT=3100 ENABLE_TEST_HOOKS=1 node src/server.js', url: 'http://localhost:3100/api/health', reuseExistingServer: !process.env.CI }
});
