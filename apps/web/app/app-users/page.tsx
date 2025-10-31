import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { AppLayout } from "@/components/app-layout"
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Shield,
  UserCircle,
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

// 模拟平台用户数据
const mockUsers = [
  {
    id: "1",
    name: "张三",
    email: "zhangsan@example.com",
    role: "admin" as const,
    status: "active" as const,
    createdAt: "2023-01-15",
    lastLoginAt: "2024-01-15 10:30:00",
  },
  {
    id: "2",
    name: "李四",
    email: "lisi@example.com",
    role: "app_manager" as const,
    status: "active" as const,
    createdAt: "2023-02-20",
    lastLoginAt: "2024-01-14 14:20:00",
  },
  {
    id: "3",
    name: "王五",
    email: "wangwu@example.com",
    role: "viewer" as const,
    status: "active" as const,
    createdAt: "2023-03-10",
    lastLoginAt: "2024-01-13 09:15:00",
  },
  {
    id: "4",
    name: "赵六",
    email: "zhaoliu@example.com",
    role: "app_manager" as const,
    status: "inactive" as const,
    createdAt: "2023-04-05",
    lastLoginAt: "2024-01-01 11:00:00",
  },
]

function getRoleBadge(role: string) {
  const roleMap = {
    admin: { label: "管理员", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    app_manager: { label: "应用管理员", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    viewer: { label: "查看者", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
  }
  const roleInfo = roleMap[role as keyof typeof roleMap] || roleMap.viewer

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${roleInfo.color}`}>
      <Shield className="h-3 w-3" />
      {roleInfo.label}
    </span>
  )
}

function getStatusBadge(status: string) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
      <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
      活跃
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-600"></span>
      禁用
    </span>
  )
}

export default function AppUsersPage() {
  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter((u) => u.status === "active").length,
    inactive: mockUsers.filter((u) => u.status === "inactive").length,
    admins: mockUsers.filter((u) => u.role === "admin").length,
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">平台用户管理</h1>
            <p className="text-muted-foreground mt-1">
              管理系统用户账号和权限
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            添加用户
          </Button>
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
              <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
              <span className="h-2 w-2 rounded-full bg-green-600"></span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">禁用用户</CardTitle>
              <span className="h-2 w-2 rounded-full bg-gray-600"></span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">管理员</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>
                  共 {mockUsers.length} 个用户，其中 {stats.active} 个活跃
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户名或邮箱..."
                    className="pl-9"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="筛选角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有角色</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="app_manager">应用管理员</SelectItem>
                    <SelectItem value="viewer">查看者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>最后登录</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{user.lastLoginAt.split(" ")[0]}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.lastLoginAt.split(" ")[1]}
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
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem>重置密码</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={
                              user.status === "active"
                                ? "text-orange-600"
                                : "text-green-600"
                            }
                          >
                            {user.status === "active" ? "禁用账户" : "启用账户"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除用户
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

