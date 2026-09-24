import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000)

// E2E_SERVER=production runs the suite against `next start`, which needs a
// finished `next build`. CI does this, so the suite checks what ships. Local
// runs default to `next dev`; the few checks that only mean something against
// a production build skip themselves there and say why.
const production = process.env.E2E_SERVER === 'production'

// GitHub Actions sets CI: fail on a stray test.only, retry once (a test that
// only passes on its retry is still reported as flaky, and the retry records a
// trace), and report failures inline on the pull request. Local runs keep
// Playwright's defaults.
const ci = !!process.env.CI

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  workers: ci ? 2 : undefined,
  reporter: ci ? [['github'], ['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: production ? `npm run start -- --port ${port}` : `npm run dev -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 120000,
  },
})
