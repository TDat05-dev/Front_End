export type Gender = 'male' | 'female' | 'other' | ''

export interface Profile {
  displayName: string
  birthday: string
  gender: Gender
  bio: string
}

export const DISPLAY_NAME_MAX_LENGTH = 50
export const BIO_MAX_LENGTH = 150

const KEY_PREFIX = 'loza_profile_'
const GENDERS: Gender[] = ['male', 'female', 'other', '']
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function defaultProfile(username: string): Profile {
  return { displayName: username, birthday: '', gender: '', bio: '' }
}

export function getProfile(username: string): Profile {
  const fallback = defaultProfile(username)
  try {
    const raw = localStorage.getItem(KEY_PREFIX + username)
    if (!raw) return fallback

    const data: unknown = JSON.parse(raw)
    if (!data || typeof data !== 'object') return fallback
    const saved = data as Record<string, unknown>

    return {
      displayName:
        typeof saved.displayName === 'string' && saved.displayName.trim()
          ? saved.displayName.slice(0, DISPLAY_NAME_MAX_LENGTH)
          : fallback.displayName,
      birthday: typeof saved.birthday === 'string' && DATE_PATTERN.test(saved.birthday) ? saved.birthday : '',
      gender: GENDERS.includes(saved.gender as Gender) ? (saved.gender as Gender) : '',
      bio: typeof saved.bio === 'string' ? saved.bio.slice(0, BIO_MAX_LENGTH) : '',
    }
  } catch {
    return fallback
  }
}

export function saveProfile(username: string, profile: Profile): boolean {
  try {
    localStorage.setItem(KEY_PREFIX + username, JSON.stringify(profile))
    return true
  } catch {
    return false
  }
}
