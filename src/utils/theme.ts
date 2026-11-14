export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'loza_theme'

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

export function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isTheme(saved)) return saved
  } catch {
  }
  return 'light'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}

export function saveTheme(theme: Theme): void {
  applyTheme(theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
  }
}
