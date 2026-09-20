import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Vitest defaults to 5s, which is marginal here. Under parallel load,
    // tests that pass comfortably in isolation time out instead: ConsentBanner,
    // CoveragePlaceList, ServicesBoard, MobileNav, LeadFormAvailability and
    // lead-origin have all flaked this way, none of them for a real reason.
    // A flaky suite is worse than a slow one, because it teaches you to
    // re-run until green and a genuine failure then looks like noise.
    // Only a hung test pays this cost; a passing one returns when it returns.
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
