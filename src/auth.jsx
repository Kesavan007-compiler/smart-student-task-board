/**
 * AUTH CONTEXT
 * -------------------------------------------------------------
 * React "context" lets any component read the logged-in user
 * without passing props through every level.
 */
import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken, clearToken } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load: if a token is stored, ask the server who it belongs to.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const data = await api.me()
        if (!cancelled) setUser(data.user)
      } catch {
        clearToken()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  async function login(email, password) {
    const data = await api.login({ email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function register(name, email, password) {
    const data = await api.register({ name, email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
