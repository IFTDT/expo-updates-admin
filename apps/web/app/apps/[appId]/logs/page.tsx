import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { AppLayout } from "@/components/app-layout"
import {
  FileText,
  Search,
  Filter,
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

// 模拟应用数据
const getAppData = (appId: string) => {
  const apps = {
    "1": { id: "1", name: "购物 App", icon: "🛒" },
    "2": { id: "2", name: "社交 App", icon: "💬" },
    "3": { id: "3", name: "新闻 App", icon: "📰" },
  }
  return apps[appId as keyof typeof apps]
}

// 模拟日志数据
const getLogs = (appId: string) => {
  return [
    {
      id: "log1",
      type: "update",
      action: "发布版本 1.2.0",
      targetId: "v1",
      targetType: "version",
      status: "success",
      details: {
        version: "1.2.0",
        userCount: 1250,
      },
      userId: "张三",
      createdAt: "2024-01-15 10:30:00",
    },
    {
      id: "log2",
      type: "rollback",
      action: "回滚版本 1.1.8",
      targetId: "v3",
      targetType: "version",
      status: "success",
      details: {
        fromVersion: "1.1.8",
        toVersion: "1.1.7",
        reason: "发现严重bug",
      },
      userId: "李四",
      createdAt: "2024-01-06 16:45:00",
    },
    {
      id: "log3",
      type: "version_create",
      action: "创建版本 1.1.9",
      targetId: "v2",
      targetType: "version",
      status: "success",
      details: {
        version: "1.1.9",
        name: "Bug修复版本",
      },
      userId: "王五",
      createdAt: "2024-01-10 14:20:00",
    },
    {
      id: "log4",
      type: "update",
      action: "更新用户 user-001 到版本 1.2.0",
      targetId: "u1",
      targetType: "user",
      status: "success",
      details: {
        userId: "user-001",
        version: "1.2.0",
      },
      userId: "张三",
      createdAt: "2024-01-14 09:15:00",
    },
    {
      id: "log5",
      type: "update",
      action: "发布版本 1.1.9",
      targetId: "v2",
      targetType: "version",
      status: "failed",
      details: {
        version: "1.1.9",
        error: "上传失败：文件损坏",
      },
      userId: "李四",
      createdAt: "2024-01-09 11:30:00",
    },
  ]
}

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

interface LogsPageProps {
  params: Promise<{ appId: string }>
}

export default async function LogsPage({ params }: LogsPageProps) {
  const { appId } = await params
  const app = getAppData(appId)
  const logs = getLogs(appId)

  if (!app) {
    notFound()
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出日志
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>操作日志</CardTitle>
            <CardDescription>
              共 {logs.length} 条操作记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索操作类型或操作人..."
                  className="pl-9"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="update">更新</SelectItem>
                  <SelectItem value="rollback">回滚</SelectItem>
                  <SelectItem value="version_create">版本创建</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.type)}
                        <span className="capitalize">{log.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{log.createdAt.split(" ")[0]}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.createdAt.split(" ")[1]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

