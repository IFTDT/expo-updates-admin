"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { AppLayout } from "@/components/app-layout"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Search,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { userGroupsApi, appsApi } from "@/lib/api"
import type { UserGroup, App } from "@/lib/api/types"

export default function UserGroupsPage() {
  const params = useParams()
  const appId = params.appId as string
  const [app, setApp] = useState<App | null>(null)
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

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

  const fetchGroups = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await userGroupsApi.getUserGroups(appId, {
        search: searchQuery || undefined,
      })

      if (response.success && response.data) {
        setGroups(response.data.items)
      } else {
        setError(response.error?.message || "获取分组列表失败")
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
      fetchGroups()
    }
  }, [appId, searchQuery])

  const handleCreate = () => {
    setFormData({ name: "", description: "" })
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (group: UserGroup) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (groupId: string) => {
    if (confirm("确定要删除这个分组吗？")) {
      try {
        const response = await userGroupsApi.deleteUserGroup(appId, groupId)
        if (response.success) {
          fetchGroups()
        } else {
          alert(response.error?.message || "删除失败")
        }
      } catch (err) {
        alert("网络错误，请稍后重试")
      }
    }
  }

  const handleSave = async () => {
    try {
      if (editingGroup) {
        // 编辑
        const response = await userGroupsApi.updateUserGroup(appId, editingGroup.id, {
          name: formData.name,
          description: formData.description,
        })
        if (response.success) {
          setIsEditDialogOpen(false)
          setEditingGroup(null)
          fetchGroups()
        } else {
          alert(response.error?.message || "更新失败")
        }
      } else {
        // 新建
        const response = await userGroupsApi.createUserGroup(appId, {
          name: formData.name,
          description: formData.description,
        })
        if (response.success) {
          setIsCreateDialogOpen(false)
          fetchGroups()
        } else {
          alert(response.error?.message || "创建失败")
        }
      }
      setFormData({ name: "", description: "" })
    } catch (err) {
      alert("网络错误，请稍后重试")
    }
  }

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                {app.name} - 用户分组
              </h1>
              <p className="text-muted-foreground mt-1">
                创建和管理用户分组，便于批量操作
              </p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                新建分组
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建用户分组</DialogTitle>
                <DialogDescription>
                  创建一个新的用户分组，方便管理和批量操作
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">分组名称 *</Label>
                  <Input
                    id="name"
                    placeholder="例如: VIP用户"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">分组描述</Label>
                  <Textarea
                    id="description"
                    placeholder="描述这个分组的用途..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleSave} disabled={!formData.name}>
                  创建分组
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑用户分组</DialogTitle>
              <DialogDescription>
                修改分组名称和描述
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">分组名称 *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">分组描述</Label>
                <Textarea
                  id="edit-description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingGroup(null)
                }}
              >
                取消
              </Button>
              <Button onClick={handleSave} disabled={!formData.name}>
                保存修改
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Groups Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>分组列表</CardTitle>
                <CardDescription>
                  共 {filteredGroups.length} 个分组
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索分组..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>分组名称</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>用户数</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "未找到匹配的分组" : "暂无分组，点击右上角创建"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {group.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {group.description || "-"}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{group.userCount}</span>{" "}
                          用户
                        </TableCell>
                        <TableCell>
                          {new Date(group.createdAt).toLocaleDateString("zh-CN")}
                        </TableCell>
                        <TableCell>
                          {new Date(group.updatedAt).toLocaleDateString("zh-CN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(group)}>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem>管理用户</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(group.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
