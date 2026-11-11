import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { auth } from '../auth/auth'

export default function Protected({ children }: { children: ReactNode }) {
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
