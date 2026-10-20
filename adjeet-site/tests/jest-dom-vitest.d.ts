import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

// jest-dom's own vitest typings (`@testing-library/jest-dom/vitest`) merge into
// `Assertion<T>`, the signature vitest 4 had. Vitest 5 declares
// `Assertion<R, T>`, so that merge no longer lands and every jest-dom matcher
// (toBeInTheDocument, toHaveAttribute, ...) fails `tsc`, though it still runs.
// Vitest 5 also stopped extending `jest.Matchers`, which is how the plain
// `import '@testing-library/jest-dom'` in setup.ts used to type them. Attach
// the matchers to `Matchers<R, T>` instead. The type parameter names and
// defaults must match vitest's declaration exactly for the interfaces to merge.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown>
    extends TestingLibraryMatchers<unknown, R> {}
}
