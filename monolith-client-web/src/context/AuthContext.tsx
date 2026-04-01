import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '../api'
import type { User } from '../types'

interface AuthCtx {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  updateUser: (u: User) => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('client_token')
    if (token) {
      authApi.getMe().then(setUser).catch(() => localStorage.removeItem('client_token')).finally(() => setIsLoading(false))
    } else { setIsLoading(false) }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    localStorage.setItem('client_token', res.token)
    setUser(res.user)
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    await authApi.register(name, email, password, phone)
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('client_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
