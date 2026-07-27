import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { store } from "../lib/store"

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  region: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    if (token) {
      const u = store.auth.getUserByToken(token)
      if (u) {
        setUser({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          phone: u.phone,
          region: u.region,
        })
      } else {
        localStorage.removeItem("auth-token")
      }
    }
    setLoading(false)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: u, session } = store.auth.signIn(email, password)
    localStorage.setItem("auth-token", session.token)
    setUser({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      phone: u.phone,
      region: u.region,
    })
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone: string) => {
    const { user: u, session } = store.auth.signUp(email, password, fullName, phone)
    localStorage.setItem("auth-token", session.token)
    setUser({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      phone: u.phone,
      region: u.region,
    })
  }, [])

  const signOut = useCallback(() => {
    const token = localStorage.getItem("auth-token")
    if (token) store.auth.removeSession(token)
    localStorage.removeItem("auth-token")
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
