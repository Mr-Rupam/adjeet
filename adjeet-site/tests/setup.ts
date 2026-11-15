import '@testing-library/jest-dom'
import { vi } from 'vitest'

// next/font only works under Next's compiler, which rewrites each call into a
// generated stylesheet. Under Vitest a font is just its class names.
vi.mock('next/font/local', () => ({
  default: ({ variable }: { variable?: string }) => ({
    className: 'font-mock',
    variable: variable ? variable.replace(/^--/, 'font-var-') : '',
    style: { fontFamily: 'sans-serif' },
  }),
}))
