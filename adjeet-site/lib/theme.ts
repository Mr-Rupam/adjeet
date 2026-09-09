export const STORAGE_KEY = 'adjeet-theme'
export const THEME_TOGGLE_EVENT = 'adjeet:theme-toggle'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export function resolveTheme(
  preference: ThemePreference,
  systemTheme: ResolvedTheme
): ResolvedTheme {
  return preference === 'system' ? systemTheme : preference
}
