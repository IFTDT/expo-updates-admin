"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Loader2,
  Rocket,
  Search,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { appsApi, appUsersApi, versionsApi } from "@/lib/api"
import type { App, AppUser, Version } from "@/lib/api/types"

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "published":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle2 className="h-3 w-3" />
          已发布
        </span>
      )
    case "draft":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <Clock className="h-3 w-3" />
          草稿
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {status}
        </span>
      )
  }
}

export default function UserVersionPage() {
  const params = useParams()
  const router = useRouter()
  const appId = params.appId as string
  const userId = params.userId as string

  const [app, setApp] = useState<App | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVersionId, setSelectedVersionId] = useState<string>("")
  const [isPublishing, setIsPublishing] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const fetchApp = useCallback(async () => {
    if (!appId) return
    try {
      const response = await appsApi.getApp(appId)
      if (response.success && response.data) {
        setApp(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch app info", error)
    }
  }, [appId])

  const fetchUser = useCallback(async () => {
    if (!appId || !userId) return
    try {
      const response = await appUsersApi.getAppUser(appId, userId)
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        setError(response.error?.message || "获取用户信息失败")
      }
    } catch (error) {
      setError("获取用户信息失败，请稍后重试")
    }
  }, [appId, userId])

  const fetchVersions = useCallback(async () => {
    if (!appId) return

    setLoading(true)
    setError("")

    try {
      const response = await versionsApi.getVersions(appId, {
        page: 1,
        limit: 20,
        status: "published",
        search: searchQuery || undefined,
      })

      if (response.success && response.data) {
        setVersions(response.data.items ?? [])
      } else {
        setError(response.error?.message || "获取版本列表失败")
      }
    } catch (error) {
      setError("获取版本列表失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }, [appId, searchQuery])

  useEffect(() => {
    fetchApp()
  }, [fetchApp])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchVersions()
    }, 300)

    return () => clearTimeout(handler)
  }, [fetchVersions])

  const handleSetTargetVersion = async () => {
    if (!appId || !userId || !selectedVersionId) {
      setError("请选择要设置的版本")
      return
    }

    setIsPublishing(true)
    setError("")

    try {
      const response = await appUsersApi.setTargetVersion(appId, userId, {
        versionId: selectedVersionId,
      })

      if (response.success) {
        setShowConfirmDialog(false)
        router.push(`/apps/${appId}/users`)
      } else {
        setError(response.error?.message || "设置目标版本失败")
      }
    } catch (error) {
      setError("设置目标版本失败，请稍后重试")
    } finally {
      setIsPublishing(false)
    }
  }

  const selectedVersion = versions.find((v) => v.id === selectedVersionId)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/apps/${appId}/users`)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回用户列表
          </Button>
        </div>

        {/* Header Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">选择目标版本</h1>
            <p className="text-muted-foreground mt-1">
              为用户选择目标版本，该版本将设置为用户的目标版本
            </p>
          </div>

          {/* Info Bar */}
          <div className="flex flex-wrap items-center gap-6 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
            {app && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">应用名称：</span>
                  <span className="font-medium">{app.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">App ID：</span>
                  <span className="font-medium">{app.appId}</span>
                </div>
              </>
            )}
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">用户 ID：</span>
                  <span className="font-medium">{user.userId || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">设备 ID：</span>
                  <span className="font-medium">{user.deviceId}</span>
                </div>
                {user.currentVersion && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">当前版本：</span>
                    <div className="space-y-0.5">
                      <span className="font-medium">{user.currentVersion.version}</span>
                      <div className="text-xs text-muted-foreground">
                        构建: {user.currentVersion.build} | 运行时: {user.currentVersion.runtimeVersion}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Version Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> 选择版本
              </CardTitle>
              <CardDescription>
                从已发布的版本中选择一个作为用户的目标版本
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索版本（版本号、版本名称）"
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 加载中...
                  </div>
                ) : versions.length === 0 ? (
                  <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
                    {searchQuery ? "未找到匹配的版本" : "暂无已发布的版本"}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {versions.map((version) => {
                      const isSelected = version.id === selectedVersionId
                      return (
                        <div
                          key={version.id}
                          onClick={() => setSelectedVersionId(version.id)}
                          className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{version.version}</span>
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{version.name}</p>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span>构建：{version.build}</span>
                                {version.runtimeVersion && (
                                  <span>运行时：{version.runtimeVersion}</span>
                                )}
                                <span>大小：{formatFileSize(version.fileSize)}</span>
                              </div>
                            </div>
                            {getStatusBadge(version.status)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card>
            <CardHeader>
              <CardTitle>操作</CardTitle>
              <CardDescription>确认设置目标版本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedVersion ? (
                <>
                  <div className="rounded-lg border border-primary bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">已选版本详情</h3>
                      {getStatusBadge(selectedVersion.status)}
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">版本号：</span>
                        <span className="font-medium">{selectedVersion.version}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">构建版本：</span>
                        <span className="font-medium">{selectedVersion.build}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">版本名称：</span>
                        <span className="font-medium">{selectedVersion.name}</span>
                      </div>
                      {selectedVersion.runtimeVersion && (
                        <div>
                          <span className="text-muted-foreground">运行时版本：</span>
                          <span className="font-medium">{selectedVersion.runtimeVersion}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">文件大小：</span>
                        <span className="font-medium">{formatFileSize(selectedVersion.fileSize)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">是否强制：</span>
                        <span className="font-medium">{selectedVersion.isMandatory ? "是" : "否"}</span>
                      </div>
                    </div>
                    {selectedVersion.description && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">描述：</span>
                        <p className="mt-1">{selectedVersion.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">目标用户：</span>
                      <span className="font-medium">{user?.userId || user?.deviceId || "-"}</span>
                    </div>
                    {user?.currentVersion && (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">当前版本：</span>
                          <span className="font-medium">{user.currentVersion.version}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>构建: {user.currentVersion.build}</span>
                          <span>运行时: {user.currentVersion.runtimeVersion}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  请从左侧选择要设置的版本
                </div>
              )}
              <Button
                className="w-full"
                onClick={() => setShowConfirmDialog(true)}
                disabled={!selectedVersionId || isPublishing || loading}
              >
                <Rocket className="mr-2 h-4 w-4" />
                设置目标版本
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认设置目标版本</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将版本 <strong>{selectedVersion?.version}</strong> 设置为用户{" "}
              <strong>{user?.userId || user?.deviceId || "-"}</strong> 的目标版本吗？
              <br />
              <br />
              此操作将直接设置用户的目标版本，用户将在下次检查更新时收到此版本。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleSetTargetVersion} disabled={isPublishing}>
              {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPublishing ? "设置中..." : "确认设置"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}

