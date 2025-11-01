"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { apiClient } from "@/lib/api/client"
import type { User } from "@/lib/api/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  // 检查认证状态
  const checkAuth = React.useCallback(async () => {
    const token = apiClient.getAccessToken()

    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await authApi.getCurrentUser()
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        setUser(null)
        // 清除无效 token
        apiClient.setAccessToken(null)
        if (typeof window !== "undefined") {
          localStorage.removeItem("refreshToken")
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
      apiClient.setAccessToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初始化时检查认证状态
  React.useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // 登录
  const login = React.useCallback(
    async (email: string, password: string, rememberMe = false) => {
      try {
        const response = await authApi.login(email, password, rememberMe)
        if (response.success && response.data) {
          setUser(response.data.user)
          return true
        }
        return false
      } catch (error) {
        console.error("Login failed:", error)
        return false
      }
    },
    []
  )

  // 登出
  const logout = React.useCallback(async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setUser(null)
      router.push("/login")
    }
  }, [router])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

