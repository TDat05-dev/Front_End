import type { Contact } from './contacts'

function storageKey(owner: string) {
  return `loza_added_${owner}`
}

export function getAddedContacts(owner: string): Contact[] {
  try {
    const saved = localStorage.getItem(storageKey(owner))
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function addContact(owner: string, name: string) {
  const list = getAddedContacts(owner)
  if (list.some((c) => c.name === name)) return
  const contact: Contact = { name, type: 0, actionTime: new Date().toISOString() }
  try {
    localStorage.setItem(storageKey(owner), JSON.stringify([contact, ...list]))
  } catch {
    return
  }
}
