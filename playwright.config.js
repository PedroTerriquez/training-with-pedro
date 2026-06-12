const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
    viewport: { width: 390, height: 844 },
    browserName: 'chromium',
  },
  webServer: {
    command: 'npx http-server . -p 8080 -c-1 --silent',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
})
