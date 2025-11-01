"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // 已登录，重定向到应用列表页
        router.push("/apps")
      } else {
        // 未登录，重定向到登录页
        router.push("/login")
      }
    }
  }, [isAuthenticated, isLoading, router])

  // 显示加载状态
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
}
