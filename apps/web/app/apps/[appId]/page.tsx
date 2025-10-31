"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { AppLayout } from "@/components/app-layout"
import {
  Package,
  Users,
  Activity,
  Calendar,
  Upload,
  RotateCcw,
  Settings,
} from "lucide-react"
import { appsApi } from "@/lib/api"
import type { App } from "@/lib/api/types"

export default function AppDetailPage() {
  const params = useParams()
  const router = useRouter()
  const appId = params.appId as string
  const [app, setApp] = useState<App | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchApp = async () => {
      setLoading(true)
      setError("")

      try {
        const response = await appsApi.getApp(appId)

        if (response.success && response.data) {
          setApp(response.data)
        } else {
          setError(response.error?.message || "获取应用信息失败")
        }
      } catch (err) {
        setError("网络错误，请稍后重试")
      } finally {
        setLoading(false)
      }
    }

    if (appId) {
      fetchApp()
    }
  }, [appId])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </AppLayout>
    )
  }

  if (error || !app) {
    return (
      <AppLayout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              {error || "应用不存在"}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/apps")}
            >
              返回应用列表
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <span className="text-4xl">{app.icon || "📱"}</span>
                {app.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {app.description || "暂无描述"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              设置
            </Button>
            <Link href={`/apps/${appId}/versions/new`}>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                发布新更新
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">当前版本</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {app.currentVersion || "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                已发布 {app.versions || 0} 个版本
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {app.userCount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">活跃用户</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">更新次数</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{app.updateCount}</div>
              <p className="text-xs text-muted-foreground">总更新次数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">最后更新</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(app.updatedAt).toLocaleDateString("zh-CN", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(app.updatedAt).toLocaleDateString("zh-CN")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Overview Content */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>应用信息</CardTitle>
              <CardDescription>基本信息和配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">应用 ID</span>
                  <span className="text-sm font-medium">{app.appId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">创建时间</span>
                  <span className="text-sm font-medium">
                    {new Date(app.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">负责人</span>
                  <span className="text-sm font-medium">
                    {app.owner?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">状态</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      app.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {app.status === "active" ? "正常运行" : "异常"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
              <CardDescription>常用的管理操作</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/apps/${appId}/versions/new`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  发布新更新
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <RotateCcw className="mr-2 h-4 w-4" />
                版本回滚
              </Button>
              <Link href={`/apps/${appId}/versions`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  查看所有版本
                </Button>
              </Link>
              <Link href={`/apps/${appId}/users`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  管理用户
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
