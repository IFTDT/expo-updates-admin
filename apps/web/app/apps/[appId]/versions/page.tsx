"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { AppLayout } from "@/components/app-layout"
import { Pagination } from "@/components/pagination"
import {
  Upload,
  RotateCcw,
  Package,
  CheckCircle2,
  Clock,
  Download,
  MoreVertical,
  Trash2,
  Loader2,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { versionsApi, appsApi } from "@/lib/api"
import type { Version, App } from "@/lib/api/types"

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
}

function getStatusBadge(status: string) {
  switch (status) {
    case "published":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle2 className="h-3 w-3" />
          已发布
        </span>
      )
    case "rolled_back":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
          <RotateCcw className="h-3 w-3" />
          已回滚
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
      return null
  }
}

type ActionMessage = {
  type: "success" | "error"
  message: string
}

export default function VersionsPage() {
  const params = useParams()
  const appId = params.appId as string
  const [app, setApp] = useState<App | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null)
  const [downloadingVersionId, setDownloadingVersionId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedVersionForDelete, setSelectedVersionForDelete] = useState<Version | null>(null)
  const [deletingVersionId, setDeletingVersionId] = useState<string | null>(null)

  const fetchApp = async () => {
    try {
      const response = await appsApi.getApp(appId)
      if (response.success && response.data) {
        setApp(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch app:", err)
    }
  }

  const fetchVersions = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await versionsApi.getVersions(appId, {
        page,
        limit,
        status: statusFilter === "all" ? undefined : (statusFilter as "draft" | "published" | "rolled_back" | undefined),
      })

      if (response.success && response.data) {
        setVersions(response.data.items)
        setTotal(response.data.pagination.total)
        setTotalPages(response.data.pagination.totalPages)
      } else {
        setError(response.error?.message || "获取版本列表失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appId) {
      fetchApp()
    }
  }, [appId])

  useEffect(() => {
    if (appId) {
      fetchVersions()
    }
  }, [appId, page, statusFilter])

  const handleDownload = async (version: Version) => {
    if (!version.fileUrl) {
      setActionMessage({
        type: "error",
        message: "该版本没有可下载的文件",
      })
      return
    }

    setDownloadingVersionId(version.id)
    setActionMessage(null)

    try {
      const blob = await versionsApi.downloadVersionFile(version.fileUrl)
      const urlWithoutQuery = version.fileUrl.split(/[?#]/)[0]
      const guessedFileName = urlWithoutQuery.substring(urlWithoutQuery.lastIndexOf("/") + 1)
      const sanitizedAppName = (app?.name ?? "app").replace(/\s+/g, "-")
      const fallbackFileName =
        guessedFileName && guessedFileName.length > 0
          ? guessedFileName
          : `${sanitizedAppName}-${version.version || version.id}.tar.gz`
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = fallbackFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)

      setActionMessage({
        type: "success",
        message: `已开始下载版本 ${version.version} 的更新包`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "下载失败，请稍后重试"
      console.error("下载更新包失败:", err)
      setActionMessage({
        type: "error",
        message,
      })
    } finally {
      setDownloadingVersionId(null)
    }
  }

  const handleDeleteMenuSelect = (version: Version) => {
    setSelectedVersionForDelete(version)
    setShowDeleteDialog(true)
  }

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open && deletingVersionId !== null) {
      return
    }
    setShowDeleteDialog(open)
    if (!open) {
      setSelectedVersionForDelete(null)
    }
  }

  const handleDeleteVersion = async () => {
    if (!selectedVersionForDelete) {
      return
    }

    setDeletingVersionId(selectedVersionForDelete.id)
    setActionMessage(null)

    try {
      const response = await versionsApi.deleteVersion(appId, selectedVersionForDelete.id)
      if (response.success) {
        setActionMessage({
          type: "success",
          message: `版本 ${selectedVersionForDelete.version} 已删除`,
        })
        setShowDeleteDialog(false)
        setSelectedVersionForDelete(null)
        await fetchVersions()
      } else {
        throw new Error(response.error?.message || "删除版本失败")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "删除版本失败，请稍后重试"
      console.error("删除版本失败:", err)
      setActionMessage({
        type: "error",
        message,
      })
    } finally {
      setDeletingVersionId(null)
    }
  }

  if (!app) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </AppLayout>
    )
  }

  const publishedCount = versions.filter((v) => v.status === "published").length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {app.name} - 版本管理
              </h1>
              <p className="text-muted-foreground mt-1">
                管理应用的所有版本和更新
              </p>
            </div>
          </div>
          <Link href={`/apps/${appId}/versions/new`}>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              发布新更新
            </Button>
          </Link>
        </div>

        {/* Versions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>版本列表</CardTitle>
                <CardDescription>
                  共 {total} 个版本，其中 {publishedCount} 个已发布
                </CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="rolled_back">已回滚</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            {actionMessage && (
              <div
                className={`mb-4 rounded border px-3 py-2 text-sm ${
                  actionMessage.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-300"
                    : "border-destructive bg-destructive/10 text-destructive"
                }`}
              >
                {actionMessage.message}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                加载中...
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>版本号</TableHead>
                      <TableHead>构建版本</TableHead>
                      <TableHead>运行时版本</TableHead>
                      <TableHead>版本名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>文件大小</TableHead>
                      <TableHead>用户数</TableHead>
                      <TableHead>发布时间</TableHead>
                      <TableHead>发布人</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                          暂无版本数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      versions.map((version) => (
                        <TableRow key={version.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {version.version}
                              {version.isMandatory && (
                                <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                                  强制
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{version.build || "-"}</TableCell>
                          <TableCell>{version.runtimeVersion || "-"}</TableCell>
                          <TableCell>{version.name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {version.description || "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(version.status)}</TableCell>
                          <TableCell>{formatFileSize(version.fileSize)}</TableCell>
                          <TableCell>
                            {version.userCount > 0
                              ? version.userCount.toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {version.publishedAt ? (
                              <div className="space-y-1">
                                <div>
                                  {new Date(version.publishedAt).toLocaleDateString("zh-CN")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(version.publishedAt).toLocaleTimeString("zh-CN")}
                                </div>
                                {version.rolledBackAt && (
                                  <div className="text-xs text-red-600">
                                    回滚: {new Date(version.rolledBackAt).toLocaleDateString("zh-CN")}
                                  </div>
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {version.publisher?.name || version.publishedBy || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() => handleDownload(version)}
                                  disabled={downloadingVersionId === version.id}
                                >
                                  {downloadingVersionId === version.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                  )}
                                  {downloadingVersionId === version.id ? "下载中..." : "下载更新包"}
                                </DropdownMenuItem>
                                {version.status === "published" && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
                                    onSelect={() => handleDeleteMenuSelect(version)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    删除版本
                                  </DropdownMenuItem>
                                )}
                                {version.status === "draft" && (
                                  <>
                                    <DropdownMenuItem>编辑</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      删除
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    total={total}
                    limit={limit}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={handleDeleteDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除版本</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除版本{" "}
              <strong>{selectedVersionForDelete?.version ?? "该"}</strong>{" "}
              吗？此操作不可恢复，相关更新包将无法继续下载。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingVersionId !== null}>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteVersion}
              disabled={deletingVersionId !== null}
              className="gap-2"
            >
              {deletingVersionId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                "确认删除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
