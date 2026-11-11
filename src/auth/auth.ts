const AUTH_KEY = 'loza_auth'

interface AuthState {
  isAuthenticated: boolean
  user: string | null
  reLoginCode: string | null
}

function loadAuth(): AuthState {
  try {
    const saved = sessionStorage.getItem(AUTH_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    return { isAuthenticated: false, user: null, reLoginCode: null }
  }
  return { isAuthenticated: false, user: null, reLoginCode: null }
}

export const auth: AuthState = loadAuth()

export function saveAuth(user: string, reLoginCode: string) {
  auth.isAuthenticated = true
  auth.user = user
  auth.reLoginCode = reLoginCode
  try {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(auth))
  } catch {
    return
  }
}

export function clearAuth() {
  auth.isAuthenticated = false
  auth.user = null
  auth.reLoginCode = null
  try {
    sessionStorage.removeItem(AUTH_KEY)
  } catch {
    return
  }
}
