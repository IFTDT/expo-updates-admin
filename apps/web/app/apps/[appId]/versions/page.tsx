import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { AppLayout } from "@/components/app-layout"
import {
  Upload,
  RotateCcw,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  MoreVertical,
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

// 模拟应用数据
const getAppData = (appId: string) => {
  const apps = {
    "1": { id: "1", name: "购物 App", icon: "🛒" },
    "2": { id: "2", name: "社交 App", icon: "💬" },
    "3": { id: "3", name: "新闻 App", icon: "📰" },
  }
  return apps[appId as keyof typeof apps]
}

// 模拟版本数据
const getVersions = (appId: string) => {
  return [
    {
      id: "v1",
      version: "1.2.0",
      name: "功能优化版本",
      description: "优化了购物车功能，提升了用户体验",
      status: "published" as const,
      publishedAt: "2024-01-15 10:30:00",
      publishedBy: "张三",
      fileSize: 5242880, // 5MB
      userCount: 1250,
      isMandatory: true,
    },
    {
      id: "v2",
      version: "1.1.9",
      name: "Bug修复版本",
      description: "修复了支付页面的几个关键bug",
      status: "published" as const,
      publishedAt: "2024-01-10 14:20:00",
      publishedBy: "李四",
      fileSize: 3145728, // 3MB
      userCount: 980,
      isMandatory: false,
    },
    {
      id: "v3",
      version: "1.1.8",
      name: "性能优化",
      description: "优化了应用启动速度和内存占用",
      status: "rolled_back" as const,
      publishedAt: "2024-01-05 09:15:00",
      rolledBackAt: "2024-01-06 16:45:00",
      publishedBy: "王五",
      fileSize: 4194304, // 4MB
      userCount: 0,
      isMandatory: false,
    },
    {
      id: "v4",
      version: "1.1.7",
      name: "新功能版本",
      description: "新增了商品收藏和分享功能",
      status: "published" as const,
      publishedAt: "2024-01-01 11:00:00",
      publishedBy: "张三",
      fileSize: 6291456, // 6MB
      userCount: 650,
      isMandatory: false,
    },
  ]
}

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

interface VersionsPageProps {
  params: Promise<{ appId: string }>
}

export default async function VersionsPage({ params }: VersionsPageProps) {
  const { appId } = await params
  const app = getAppData(appId)
  const versions = getVersions(appId)

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
            <CardTitle>版本列表</CardTitle>
            <CardDescription>
              共 {versions.length} 个版本，其中{" "}
              {versions.filter((v) => v.status === "published").length} 个已发布
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>版本号</TableHead>
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
                {versions.map((version) => (
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
                    <TableCell>{version.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {version.description}
                    </TableCell>
                    <TableCell>{getStatusBadge(version.status)}</TableCell>
                    <TableCell>{formatFileSize(version.fileSize)}</TableCell>
                    <TableCell>
                      {version.userCount > 0
                        ? version.userCount.toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{version.publishedAt.split(" ")[0]}</div>
                        <div className="text-xs text-muted-foreground">
                          {version.publishedAt.split(" ")[1]}
                        </div>
                        {version.rolledBackAt && (
                          <div className="text-xs text-red-600">
                            回滚: {version.rolledBackAt.split(" ")[0]}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{version.publishedBy}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            下载更新包
                          </DropdownMenuItem>
                          {version.status === "published" && (
                            <DropdownMenuItem>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              回滚版本
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

