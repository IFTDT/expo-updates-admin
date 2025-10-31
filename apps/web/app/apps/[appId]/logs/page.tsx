"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { AppLayout } from "@/components/app-layout"
import { Pagination } from "@/components/pagination"
import {
  FileText,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Upload,
  RotateCcw,
  Package,
  Users,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { logsApi, appsApi } from "@/lib/api"
import type { Log, App } from "@/lib/api/types"

function getActionIcon(type: string) {
  switch (type) {
    case "update":
      return <Upload className="h-4 w-4" />
    case "rollback":
      return <RotateCcw className="h-4 w-4" />
    case "version_create":
      return <Package className="h-4 w-4" />
    case "user_update":
      return <Users className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

function getStatusBadge(status: string) {
  return status === "success" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
      <CheckCircle2 className="h-3 w-3" />
      成功
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
      <XCircle className="h-3 w-3" />
      失败
    </span>
  )
}

export default function LogsPage() {
  const params = useParams()
  const appId = params.appId as string
  const [app, setApp] = useState<App | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

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

  const fetchLogs = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await logsApi.getLogs(appId, {
        page,
        limit,
        search: search || undefined,
        type: typeFilter || undefined,
        status: statusFilter as "success" | "failed" | undefined,
      })

      if (response.success && response.data) {
        setLogs(response.data.items)
        setTotal(response.data.pagination.total)
        setTotalPages(response.data.pagination.totalPages)
      } else {
        setError(response.error?.message || "获取日志列表失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await logsApi.exportLogs(appId, {
        format: "csv",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `logs-${appId}-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert("导出失败，请稍后重试")
    }
  }

  useEffect(() => {
    if (appId) {
      fetchApp()
    }
  }, [appId])

  useEffect(() => {
    if (appId) {
      fetchLogs()
    }
  }, [appId, page, typeFilter, statusFilter])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchLogs()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  if (!app) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
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
              <h1 className="text-3xl font-bold tracking-tight">
                {app.name} - 操作日志
              </h1>
              <p className="text-muted-foreground mt-1">
                查看所有操作记录和历史
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出日志
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>操作日志</CardTitle>
            <CardDescription>
              共 {total} 条操作记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索操作类型或操作人..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有类型</SelectItem>
                  <SelectItem value="update">更新</SelectItem>
                  <SelectItem value="rollback">回滚</SelectItem>
                  <SelectItem value="version_create">版本创建</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有状态</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="mb-4 text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
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
                      <TableHead>操作类型</TableHead>
                      <TableHead>操作描述</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作人</TableHead>
                      <TableHead>操作时间</TableHead>
                      <TableHead>详情</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          暂无日志数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.type)}
                              <span className="capitalize">{log.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{log.action}</TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell>{log.user?.name || log.userId}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div>
                                {new Date(log.createdAt).toLocaleDateString("zh-CN")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleTimeString("zh-CN")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              查看详情
                            </Button>
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
    </AppLayout>
  )
}
