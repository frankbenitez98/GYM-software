import { createContext } from 'react'
import type { IUserResponse } from '@shared/auth'

export interface AuthState {
  user: IUserResponse | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)
