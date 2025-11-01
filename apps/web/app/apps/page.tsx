"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Package, Activity, Users, ArrowRight, Search, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { AppLayout } from "@/components/app-layout"
import { Pagination } from "@/components/pagination"
import { appsApi } from "@/lib/api"
import type { App, CreateAppRequest } from "@/lib/api/types"

export default function AppsPage() {
  const router = useRouter()
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("")

  // 创建应用对话框状态
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState<CreateAppRequest>({
    name: "",
    appId: "",
    description: "",
    icon: "",
  })
  const [createError, setCreateError] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const fetchApps = async () => {
    setLoading(true)
    setError("")

    try {
      // 如果搜索词太短，不发送搜索请求
      const searchParam = search && search.trim().length >= 2 ? search.trim() : undefined

      const response = await appsApi.getApps({
        page,
        limit,
        search: searchParam,
        status: (status && (status === "active" || status === "inactive")) ? status as "active" | "inactive" : undefined,
      })

      if (response.success && response.data) {
        setApps(response.data.items)
        setTotal(response.data.pagination.total)
        setTotalPages(response.data.pagination.totalPages)
      } else {
        setError(response.error?.message || "获取应用列表失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
      console.error("获取应用列表错误:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [page, search, status])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchApps()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // 处理创建应用
  const handleCreateApp = async () => {
    if (!createFormData.name || !createFormData.appId) {
      setCreateError("请填写应用名称和应用 ID")
      return
    }

    if (createFormData.name.trim().length === 0) {
      setCreateError("应用名称不能为空")
      return
    }

    if (createFormData.appId.trim().length === 0) {
      setCreateError("应用 ID 不能为空")
      return
    }

    // 验证图标 URL（如果提供）
    if (createFormData.icon && createFormData.icon.trim() !== "") {
      try {
        new URL(createFormData.icon)
      } catch {
        setCreateError("图标 URL 格式不正确")
        return
      }
    }

    setIsCreating(true)
    setCreateError("")

    try {
      const response = await appsApi.createApp({
        name: createFormData.name.trim(),
        appId: createFormData.appId.trim(),
        description: createFormData.description?.trim() || undefined,
        icon: createFormData.icon?.trim() || undefined,
      })

      if (response.success && response.data) {
        setIsCreateDialogOpen(false)
        setCreateFormData({
          name: "",
          appId: "",
          description: "",
          icon: "",
        })
        // 刷新应用列表
        fetchApps()
        // 跳转到新创建的应用详情页
        router.push(`/apps/${response.data.id}`)
      } else {
        setCreateError(response.error?.message || "创建应用失败")
      }
    } catch (err) {
      setCreateError("创建应用失败，请稍后重试")
      console.error("创建应用错误:", err)
    } finally {
      setIsCreating(false)
    }
  }

  // 统计信息
  const stats = {
    total: apps.length,
    totalUsers: apps.reduce((sum, app) => sum + (app.userCount || 0), 0),
    totalUpdates: apps.reduce((sum, app) => sum + (app.updateCount || 0), 0),
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">应用管理</h1>
            <p className="text-muted-foreground">
              管理您的 Expo 应用热更新
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            添加应用
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总应用数</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">
                全部应用
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                活跃用户总数
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">更新次数</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalUpdates}
              </div>
              <p className="text-xs text-muted-foreground">
                总更新次数
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索应用名称或应用 ID..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">加载中...</p>
            </CardContent>
          </Card>
        )}

        {/* App List */}
        {!loading && !error && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apps.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  暂无应用，点击右上角添加应用
                </div>
              ) : (
                apps.map((app) => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{app.icon || "📱"}</div>
                          <div>
                            <CardTitle className="text-lg">{app.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {app.appId}
                            </CardDescription>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            app.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          }`}
                        >
                          {app.status === "active" ? "正常" : "异常"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">当前版本</span>
                          <span className="font-medium">{app.currentVersion || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">用户数</span>
                          <span className="font-medium">
                            {app.userCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">更新时间</span>
                          <span className="font-medium">
                            {new Date(app.updatedAt).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                      </div>
                      <Link href={`/apps/${app.id}`}>
                        <Button className="w-full" variant="outline">
                          进入管理
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  total={total}
                  limit={limit}
                  onPageChange={setPage}
                />
              </Card>
            )}
          </>
        )}

        {/* 创建应用对话框 */}
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (!open) {
              setCreateError("")
              setCreateFormData({
                name: "",
                appId: "",
                description: "",
                icon: "",
              })
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加应用</DialogTitle>
              <DialogDescription>
                创建新的 Expo 应用来管理热更新
              </DialogDescription>
            </DialogHeader>
            {createError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {createError}
              </div>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">应用名称 *</Label>
                <Input
                  id="create-name"
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, name: e.target.value })
                  }
                  placeholder="例如：我的移动应用"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  应用的显示名称
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-appId">应用 ID *</Label>
                <Input
                  id="create-appId"
                  value={createFormData.appId}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, appId: e.target.value })
                  }
                  placeholder="例如：com.example.myapp"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  应用的唯一标识符，通常与 Expo 项目的 app.json 中的 appId 一致
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">应用描述</Label>
                <Textarea
                  id="create-description"
                  rows={3}
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="描述应用的用途和功能..."
                />
                <p className="text-xs text-muted-foreground">
                  可选，用于描述应用的基本信息
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-icon">应用图标 URL</Label>
                <Input
                  id="create-icon"
                  type="url"
                  value={createFormData.icon}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, icon: e.target.value })
                  }
                  placeholder="https://example.com/icon.png"
                />
                <p className="text-xs text-muted-foreground">
                  可选，应用的图标 URL（支持 emoji 或图片链接）
                </p>
                {createFormData.icon && (
                  <div className="mt-2 p-2 border rounded-md bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">预览：</div>
                    <div className="text-4xl">
                      {createFormData.icon.startsWith("http") ? (
                        <img
                          src={createFormData.icon}
                          alt="Icon preview"
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      ) : (
                        createFormData.icon || "📱"
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                取消
              </Button>
              <Button onClick={handleCreateApp} disabled={isCreating}>
                {isCreating ? "创建中..." : "创建应用"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
