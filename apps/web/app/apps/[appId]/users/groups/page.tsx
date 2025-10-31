"use client"

import { useState, useEffect } from "react"
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

// 模拟应用数据
const getAppData = (appId: string) => {
  const apps = {
    "1": { id: "1", name: "购物 App", icon: "🛒" },
    "2": { id: "2", name: "社交 App", icon: "💬" },
    "3": { id: "3", name: "新闻 App", icon: "📰" },
  }
  return apps[appId as keyof typeof apps]
}

// 模拟分组数据
const mockGroups = [
  {
    id: "g1",
    name: "VIP用户",
    description: "高级付费用户组",
    userCount: 120,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-10",
  },
  {
    id: "g2",
    name: "测试用户",
    description: "内部测试人员",
    userCount: 45,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-12",
  },
  {
    id: "g3",
    name: "Beta测试组",
    description: "参与Beta测试的用户",
    userCount: 230,
    createdAt: "2023-12-20",
    updatedAt: "2024-01-08",
  },
]

interface UserGroupsPageProps {
  params: Promise<{ appId: string }>
}

export default function UserGroupsPage({ params }: UserGroupsPageProps) {
  const [appId, setAppId] = useState<string>("")
  const [groups, setGroups] = useState(mockGroups)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<typeof mockGroups[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  // 初始化 appId
  useEffect(() => {
    params.then((p) => setAppId(p.appId))
  }, [params])

  const handleCreate = () => {
    setFormData({ name: "", description: "" })
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (group: typeof mockGroups[0]) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (groupId: string) => {
    if (confirm("确定要删除这个分组吗？")) {
      setGroups(groups.filter((g) => g.id !== groupId))
    }
  }

  const handleSave = () => {
    if (editingGroup) {
      // 编辑
      setGroups(
        groups.map((g) =>
          g.id === editingGroup.id
            ? {
                ...g,
                name: formData.name,
                description: formData.description,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : g
        )
      )
      setIsEditDialogOpen(false)
      setEditingGroup(null)
    } else {
      // 新建
      const newGroup = {
        id: `g${Date.now()}`,
        name: formData.name,
        description: formData.description,
        userCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }
      setGroups([...groups, newGroup])
      setIsCreateDialogOpen(false)
    }
    setFormData({ name: "", description: "" })
  }

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const app = appId ? getAppData(appId) : null

  if (!app) {
    return null
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
                      <TableCell>{group.createdAt}</TableCell>
                      <TableCell>{group.updatedAt}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

