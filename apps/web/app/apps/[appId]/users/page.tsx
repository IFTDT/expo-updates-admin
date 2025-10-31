import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { AppLayout } from "@/components/app-layout"
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Download,
  RefreshCw,
  Smartphone,
  Monitor,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
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

// 模拟用户数据
const getUsers = (appId: string) => {
  return [
    {
      id: "u1",
      deviceId: "device-abc123",
      userId: "user-001",
      currentVersion: "1.2.0",
      lastUpdateAt: "2024-01-15 10:30:00",
      platform: "ios" as const,
      osVersion: "17.2",
      appVersion: "1.2.0",
      status: "online" as const,
    },
    {
      id: "u2",
      deviceId: "device-def456",
      userId: "user-002",
      currentVersion: "1.1.9",
      lastUpdateAt: "2024-01-14 14:20:00",
      platform: "android" as const,
      osVersion: "14.0",
      appVersion: "1.1.9",
      status: "online" as const,
    },
    {
      id: "u3",
      deviceId: "device-ghi789",
      userId: "user-003",
      currentVersion: "1.2.0",
      lastUpdateAt: "2024-01-15 09:15:00",
      platform: "ios" as const,
      osVersion: "17.1",
      appVersion: "1.2.0",
      status: "offline" as const,
    },
    {
      id: "u4",
      deviceId: "device-jkl012",
      userId: "user-004",
      currentVersion: "1.1.8",
      lastUpdateAt: "2024-01-10 16:45:00",
      platform: "android" as const,
      osVersion: "13.0",
      appVersion: "1.1.8",
      status: "offline" as const,
    },
    {
      id: "u5",
      deviceId: "device-mno345",
      userId: "user-005",
      currentVersion: "1.2.0",
      lastUpdateAt: "2024-01-15 11:20:00",
      platform: "ios" as const,
      osVersion: "16.5",
      appVersion: "1.2.0",
      status: "online" as const,
    },
  ]
}

function getStatusBadge(status: string) {
  return status === "online" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
      <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
      在线
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-600"></span>
      离线
    </span>
  )
}

function getPlatformIcon(platform: string) {
  return platform === "ios" ? (
    <Smartphone className="h-4 w-4 text-blue-600" />
  ) : (
    <Monitor className="h-4 w-4 text-green-600" />
  )
}

interface UsersPageProps {
  params: Promise<{ appId: string }>
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { appId } = await params
  const app = getAppData(appId)
  const users = getUsers(appId)

  if (!app) {
    notFound()
  }

  // 统计信息
  const stats = {
    total: users.length,
    online: users.filter((u) => u.status === "online").length,
    offline: users.filter((u) => u.status === "offline").length,
    versions: new Set(users.map((u) => u.currentVersion)).size,
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {app.name} - 用户管理
              </h1>
              <p className="text-muted-foreground mt-1">
                查看和管理应用的用户
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/apps/${appId}/users/groups`}>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                用户分组
              </Button>
            </Link>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">在线用户</CardTitle>
              <span className="h-2 w-2 rounded-full bg-green-600"></span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.online}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">离线用户</CardTitle>
              <span className="h-2 w-2 rounded-full bg-gray-600"></span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.offline}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">版本数</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.versions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
            <CardDescription>
              共 {users.length} 个用户，其中 {stats.online} 个在线
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户 ID 或设备 ID..."
                  className="pl-9"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选版本" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有版本</SelectItem>
                  <SelectItem value="1.2.0">1.2.0</SelectItem>
                  <SelectItem value="1.1.9">1.1.9</SelectItem>
                  <SelectItem value="1.1.8">1.1.8</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="online">在线</SelectItem>
                  <SelectItem value="offline">离线</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户 ID</TableHead>
                  <TableHead>设备 ID</TableHead>
                  <TableHead>平台</TableHead>
                  <TableHead>当前版本</TableHead>
                  <TableHead>系统版本</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最后更新</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.userId}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {user.deviceId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(user.platform)}
                        <span className="capitalize">{user.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{user.currentVersion}</span>
                    </TableCell>
                    <TableCell>{user.osVersion}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{user.lastUpdateAt.split(" ")[0]}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.lastUpdateAt.split(" ")[1]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            更新到最新版本
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            回滚版本
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            导出信息
                          </DropdownMenuItem>
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

