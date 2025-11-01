"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { AppLayout } from "@/components/app-layout"
import { Pagination } from "@/components/pagination"
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
  KeyRound,
  Ban,
  CheckCircle2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
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
import { platformUsersApi, appsApi } from "@/lib/api"
import type { User, App, CreatePlatformUserRequest, UpdatePlatformUserRequest } from "@/lib/api/types"

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
  const [users, setUsers] = useState<User[]>([])
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // 对话框状态
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // 表单数据
  const [createFormData, setCreateFormData] = useState<CreatePlatformUserRequest>({
    name: "",
    email: "",
    password: "",
    role: "app_manager",
    appIds: [],
  })
  const [editFormData, setEditFormData] = useState<UpdatePlatformUserRequest>({
    name: "",
    role: "app_manager",
    status: "active",
    appIds: [],
  })
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const fetchUsers = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await platformUsersApi.getUsers({
        page,
        limit,
        search: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      })

      if (response.success && response.data) {
        setUsers(response.data.items)
        setTotal(response.data.pagination.total)
        setTotalPages(response.data.pagination.totalPages)
      } else {
        setError(response.error?.message || "获取用户列表失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const fetchApps = async () => {
    try {
      const response = await appsApi.getApps({ limit: 100 })
      if (response.success && response.data) {
        setApps(response.data.items)
      }
    } catch (err) {
      console.error("获取应用列表失败:", err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter, statusFilter])

  useEffect(() => {
    fetchApps()
  }, [])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchUsers()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // 处理创建用户
  const handleCreateUser = async () => {
    if (!createFormData.name || !createFormData.email || !createFormData.password) {
      setError("请填写所有必填字段")
      return
    }

    if (createFormData.password.length < 6) {
      setError("密码长度至少为6位")
      return
    }

    try {
      setError("")
      const response = await platformUsersApi.createUser(createFormData)
      if (response.success) {
        setIsCreateDialogOpen(false)
        setCreateFormData({
          name: "",
          email: "",
          password: "",
          role: "app_manager",
          appIds: [],
        })
        fetchUsers()
      } else {
        setError(response.error?.message || "创建用户失败")
      }
    } catch (err) {
      setError("创建用户失败，请稍后重试")
    }
  }

  // 处理编辑用户
  const handleEditUser = async () => {
    if (!selectedUser || !editFormData.name) {
      setError("请填写所有必填字段")
      return
    }

    try {
      setError("")
      const response = await platformUsersApi.updateUser(selectedUser.id, editFormData)
      if (response.success) {
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setError(response.error?.message || "更新用户失败")
      }
    } catch (err) {
      setError("更新用户失败，请稍后重试")
    }
  }

  // 处理重置密码
  const handleResetPassword = async () => {
    if (!selectedUser) return

    if (!resetPasswordData.newPassword || resetPasswordData.newPassword.length < 6) {
      setError("新密码长度至少为6位")
      return
    }

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError("两次输入的密码不一致")
      return
    }

    try {
      setError("")
      const response = await platformUsersApi.resetPassword(
        selectedUser.id,
        resetPasswordData.newPassword
      )
      if (response.success) {
        setIsResetPasswordDialogOpen(false)
        setResetPasswordData({ newPassword: "", confirmPassword: "" })
        setSelectedUser(null)
      } else {
        setError(response.error?.message || "重置密码失败")
      }
    } catch (err) {
      setError("重置密码失败，请稍后重试")
    }
  }

  // 处理切换状态
  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active"
    try {
      setError("")
      const response = await platformUsersApi.toggleStatus(user.id, newStatus)
      if (response.success) {
        fetchUsers()
      } else {
        setError(response.error?.message || "更新状态失败")
      }
    } catch (err) {
      setError("更新状态失败，请稍后重试")
    }
  }

  // 处理删除用户
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setError("")
      const response = await platformUsersApi.deleteUser(selectedUser.id)
      if (response.success) {
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setError(response.error?.message || "删除用户失败")
      }
    } catch (err) {
      setError("删除用户失败，请稍后重试")
    }
  }

  // 打开编辑对话框
  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name,
      role: user.role as "admin" | "app_manager" | "viewer",
      status: (user.status || "active") as "active" | "inactive",
      appIds: user.appIds || [],
    })
    setIsEditDialogOpen(true)
  }

  // 打开重置密码对话框
  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user)
    setResetPasswordData({ newPassword: "", confirmPassword: "" })
    setIsResetPasswordDialogOpen(true)
  }

  // 打开删除对话框
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  // 切换应用选择
  const toggleAppSelection = (appId: string, isCreate: boolean) => {
    if (isCreate) {
      const currentAppIds = createFormData.appIds || []
      if (currentAppIds.includes(appId)) {
        setCreateFormData({
          ...createFormData,
          appIds: currentAppIds.filter((id) => id !== appId),
        })
      } else {
        setCreateFormData({
          ...createFormData,
          appIds: [...currentAppIds, appId],
        })
      }
    } else {
      const currentAppIds = editFormData.appIds || []
      if (currentAppIds.includes(appId)) {
        setEditFormData({
          ...editFormData,
          appIds: currentAppIds.filter((id) => id !== appId),
        })
      } else {
        setEditFormData({
          ...editFormData,
          appIds: [...currentAppIds, appId],
        })
      }
    }
  }

  // 统计信息
  const stats = {
    total: total,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    admins: users.filter((u) => u.role === "admin").length,
  }

  // 安全访问用户属性
  const getUserStatus = (user: User) => user.status || "unknown"
  const getUserCreatedAt = (user: User) => user.createdAt || new Date().toISOString()
  const getUserLastLoginAt = (user: User) => user.lastLoginAt

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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
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
                  共 {total} 个用户，其中 {stats.active} 个活跃
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户名或邮箱..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="筛选状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          暂无用户数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
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
                          <TableCell>{getStatusBadge(getUserStatus(user))}</TableCell>
                          <TableCell>
                            {getUserCreatedAt(user) ? (
                              new Date(getUserCreatedAt(user)).toLocaleDateString("zh-CN")
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {getUserLastLoginAt(user) ? (
                              <div className="space-y-1">
                                <div>
                                  {new Date(getUserLastLoginAt(user)!).toLocaleDateString("zh-CN")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(getUserLastLoginAt(user)!).toLocaleTimeString("zh-CN")}
                                </div>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openResetPasswordDialog(user)}>
                                  <KeyRound className="mr-2 h-4 w-4" />
                                  重置密码
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className={
                                    getUserStatus(user) === "active"
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }
                                  onClick={() => handleToggleStatus(user)}
                                >
                                  {getUserStatus(user) === "active" ? (
                                    <>
                                      <Ban className="mr-2 h-4 w-4" />
                                      禁用账户
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      启用账户
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => openDeleteDialog(user)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  删除用户
                                </DropdownMenuItem>
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

        {/* 创建用户对话框 */}
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (!open) {
              setError("")
              setCreateFormData({
                name: "",
                email: "",
                password: "",
                role: "app_manager",
                appIds: [],
              })
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加用户</DialogTitle>
              <DialogDescription>创建新的平台用户账号</DialogDescription>
            </DialogHeader>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">用户名 *</Label>
                <Input
                  id="create-name"
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, name: e.target.value })
                  }
                  placeholder="请输入用户名"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">邮箱 *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createFormData.email}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">密码 *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createFormData.password}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, password: e.target.value })
                  }
                  placeholder="至少6位字符"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">角色 *</Label>
                <Select
                  value={createFormData.role}
                  onValueChange={(value: "admin" | "app_manager" | "viewer") =>
                    setCreateFormData({ ...createFormData, role: value, appIds: value !== "app_manager" ? [] : createFormData.appIds })
                  }
                >
                  <SelectTrigger id="create-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="app_manager">应用管理员</SelectItem>
                    <SelectItem value="viewer">查看者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {createFormData.role === "app_manager" && (
                <div className="space-y-2">
                  <Label>应用权限</Label>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-4 space-y-2">
                    {apps.length === 0 ? (
                      <div className="text-sm text-muted-foreground">暂无应用</div>
                    ) : (
                      apps.map((app) => (
                        <label
                          key={app.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={(createFormData.appIds || []).includes(app.id)}
                            onChange={() => toggleAppSelection(app.id, true)}
                            className="rounded"
                          />
                          <span className="text-sm">{app.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateUser}>创建用户</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 编辑用户对话框 */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) {
              setError("")
              setSelectedUser(null)
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>编辑用户</DialogTitle>
              <DialogDescription>修改用户信息和权限</DialogDescription>
            </DialogHeader>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">用户名 *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">角色 *</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value: "admin" | "app_manager" | "viewer") =>
                    setEditFormData({ ...editFormData, role: value, appIds: value !== "app_manager" ? [] : editFormData.appIds })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="app_manager">应用管理员</SelectItem>
                    <SelectItem value="viewer">查看者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">状态 *</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setEditFormData({ ...editFormData, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editFormData.role === "app_manager" && (
                <div className="space-y-2">
                  <Label>应用权限</Label>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-4 space-y-2">
                    {apps.length === 0 ? (
                      <div className="text-sm text-muted-foreground">暂无应用</div>
                    ) : (
                      apps.map((app) => (
                        <label
                          key={app.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={(editFormData.appIds || []).includes(app.id)}
                            onChange={() => toggleAppSelection(app.id, false)}
                            className="rounded"
                          />
                          <span className="text-sm">{app.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleEditUser}>保存更改</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 重置密码对话框 */}
        <Dialog
          open={isResetPasswordDialogOpen}
          onOpenChange={(open) => {
            setIsResetPasswordDialogOpen(open)
            if (!open) {
              setError("")
              setResetPasswordData({ newPassword: "", confirmPassword: "" })
              setSelectedUser(null)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>重置密码</DialogTitle>
              <DialogDescription>
                为用户 {selectedUser?.name} 设置新密码
              </DialogDescription>
            </DialogHeader>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码 *</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={resetPasswordData.newPassword}
                  onChange={(e) =>
                    setResetPasswordData({
                      ...resetPasswordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="至少6位字符"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认密码 *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) =>
                    setResetPasswordData({
                      ...resetPasswordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="请再次输入密码"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsResetPasswordDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={handleResetPassword}>确认重置</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除用户确认对话框 */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open)
            if (!open) {
              setError("")
              setSelectedUser(null)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除用户</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除用户 <strong>{selectedUser?.name}</strong> ({selectedUser?.email}) 吗？
                此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
