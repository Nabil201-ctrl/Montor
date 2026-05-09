import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/api'

interface User {
  id: string
  login: string
  name: string
  avatarUrl: string
  momentumPoints: number
  vibeScore: number
}

interface AuthCtx {
  user: User | null
  token: string | null
  loading: boolean
  setToken: (t: string) => void
  setUser: (u: User | null) => void
  logout: () => void
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('montor_token'))
  const [loading, setLoading] = useState(true)

  const setToken = (t: string) => {
    localStorage.setItem('montor_token', t)
    setTokenState(t)
  }

  const logout = () => {
    localStorage.removeItem('montor_token')
    setTokenState(null)
    setUser(null)
  }

  useEffect(() => {
    if (!token) { setLoading(false); return }
    auth.me()
      .then((u: any) => setUser(u))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [token])

  return <Ctx.Provider value={{ user, token, loading, setToken, setUser, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
