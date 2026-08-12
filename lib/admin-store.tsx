'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin'

type AdminContextValue = {
  authenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)

  function login(username: string, password: string) {
    const accepted = username === ADMIN_USERNAME && password === ADMIN_PASSWORD
    setAuthenticated(accepted)
    return accepted
  }

  function logout() {
    setAuthenticated(false)
  }

  return (
    <AdminContext.Provider value={{ authenticated, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminContext)

  if (context === null) {
    throw new Error('useAdminAuth는 AdminProvider 안에서만 사용할 수 있습니다.')
  }

  return context
}
