import { create } from 'zustand'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role?: string
  is_verified: boolean
  must_change_password: boolean
}

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  setToken: (token: string) => void
  refreshUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('kumba_token'),
  user: (() => {
    try {
      const savedUser = localStorage.getItem('kumba_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })(),
  login: (token: string, user: User): void => {
    localStorage.setItem('kumba_token', token)
    localStorage.setItem('kumba_user', JSON.stringify(user))
    set({ token, user })
  },
  setToken: (token: string): void => {
    localStorage.setItem('kumba_token', token)
    set({ token })
  },
  refreshUser: (user: User): void => {
    localStorage.setItem('kumba_user', JSON.stringify(user))
    set({ user })
  },
  logout: (): void => {
    localStorage.removeItem('kumba_token')
    localStorage.removeItem('kumba_user')
    set({ token: null, user: null })
  }
}))
