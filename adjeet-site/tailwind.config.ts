import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-elevated': 'var(--paper-elevated)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        'ink-subtle': 'var(--ink-subtle)',
        rule: 'var(--rule)',
        blue: {
          DEFAULT: 'var(--adjeet-blue)',
          deep: 'var(--adjeet-blue-deep)',
        },
        ochre: 'var(--ochre)',
        clay: 'var(--clay)',
        sage: 'var(--sage)',
        slate: 'var(--slate)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      maxWidth: {
        content: 'var(--content-max)',
      },
    },
  },
}

export default config
