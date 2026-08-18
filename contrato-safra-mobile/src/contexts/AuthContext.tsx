import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { api } from "../services/api"

interface User {
  id: string
  email: string
  full_name: string
  phone: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refresh: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token")
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }
      const { user } = await api.auth.getUser()
      setUser(user)
    } catch {
      setUser(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
