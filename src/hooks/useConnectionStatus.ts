import { useSyncExternalStore } from 'react'
import { getStatus, onStatusChange } from '../services/socket'

export function useConnectionStatus() {
  return useSyncExternalStore(onStatusChange, getStatus)
}
