"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  ArrowLeft,
  Users,
  Search,
  Trash2,
  Loader2,
  ShieldPlus,
} from "lucide-react"
import { appsApi, userGroupsApi, appUsersApi } from "@/lib/api"
import type { App, UserGroup, AppUser } from "@/lib/api/types"

export default function ManageGroupUsersPage() {
  const params = useParams()
  const router = useRouter()
  const appId = params.appId as string
  const groupId = params.groupId as string

  const [app, setApp] = useState<App | null>(null)
  const [group, setGroup] = useState<UserGroup | null>(null)
  const [groupLoading, setGroupLoading] = useState(true)
  const [groupError, setGroupError] = useState("")

  const [availableUsers, setAvailableUsers] = useState<AppUser[]>([])
  const [availableUsersLoading, setAvailableUsersLoading] = useState(false)
  const [availableUsersError, setAvailableUsersError] = useState("")
  const [userSearch, setUserSearch] = useState("")

  const [isMutating, setIsMutating] = useState(false)

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

  const fetchGroupDetail = useCallback(async () => {
    if (!appId || !groupId) return

    setGroupLoading(true)
    setGroupError("")

    try {
      const response = await userGroupsApi.getUserGroup(appId, groupId)
      if (response.success && response.data) {
        setGroup(response.data)
      } else {
        setGroupError(response.error?.message || "获取分组详情失败")
      }
    } catch (error) {
      setGroupError("获取分组详情失败，请稍后重试")
    } finally {
      setGroupLoading(false)
    }
  }, [appId, groupId])

  const fetchAvailableUsers = useCallback(
    async (keyword: string) => {
      if (!appId) return

      setAvailableUsersLoading(true)
      setAvailableUsersError("")

      try {
        const response = await appUsersApi.getAppUsers(appId, {
          page: 1,
          limit: 50,
          search: keyword || undefined,
        })

        if (response.success && response.data) {
          setAvailableUsers(response.data.items ?? [])
        } else {
          setAvailableUsersError(response.error?.message || "获取用户列表失败")
        }
      } catch (error) {
        setAvailableUsersError("获取用户列表失败，请稍后重试")
      } finally {
        setAvailableUsersLoading(false)
      }
    },
    [appId]
  )

  useEffect(() => {
    fetchApp()
  }, [fetchApp])

  useEffect(() => {
    fetchGroupDetail()
  }, [fetchGroupDetail])

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAvailableUsers(userSearch)
    }, 300)

    return () => clearTimeout(handler)
  }, [fetchAvailableUsers, userSearch])

  const handleAddUser = async (userId: string) => {
    if (!appId || !groupId) return
    setIsMutating(true)
    setGroupError("")

    try {
      const response = await userGroupsApi.addUsersToGroup(appId, groupId, [userId])
      if (!response.success) {
        setGroupError(response.error?.message || "添加用户失败")
        return
      }

      await fetchGroupDetail()
      await fetchAvailableUsers(userSearch)
    } catch (error) {
      setGroupError("添加用户失败，请稍后重试")
    } finally {
      setIsMutating(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!appId || !groupId) return
    if (!confirm("确定要将该用户移出当前分组吗？")) {
      return
    }

    setIsMutating(true)
    setGroupError("")

    try {
      const response = await userGroupsApi.removeUsersFromGroup(appId, groupId, [userId])
      if (!response.success) {
        setGroupError(response.error?.message || "移除用户失败")
        return
      }

      await fetchGroupDetail()
      await fetchAvailableUsers(userSearch)
    } catch (error) {
      setGroupError("移除用户失败，请稍后重试")
    } finally {
      setIsMutating(false)
    }
  }

  const handleBack = () => {
    router.push(`/apps/${appId}/users/groups`)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回分组列表
          </Button>
        </div>

        {/* Header Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">管理分组用户</h1>
            <p className="text-muted-foreground mt-1">
              为分组添加或移除用户，便于执行定向更新任务
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
            {group && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">当前分组：</span>
                  <span className="font-medium">{group.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">用户数量：</span>
                  <span className="font-medium">{group.userCount}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {groupError && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {groupError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" /> 当前成员
              </CardTitle>
              <CardDescription>
                当前分组共有 {group?.userCount ?? 0} 名用户，可直接进行移除操作
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 加载中...
                </div>
              ) : group && group.users && group.users.length > 0 ? (
                <div className="space-y-3">
                  {group.users.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{member.userId || member.deviceId}</p>
                        <p className="text-xs text-muted-foreground">设备 ID：{member.deviceId}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUser(member.id)}
                        disabled={isMutating}
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> 移出分组
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
                  暂无成员，可在右侧添加用户
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldPlus className="h-5 w-5" /> 添加成员
              </CardTitle>
              <CardDescription>
                支持根据用户 ID 或设备 ID 搜索，最多返回 50 条匹配结果
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户 (用户 ID / 设备 ID)"
                  className="pl-9"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                />
              </div>

              {availableUsersError && (
                <div className="rounded border border-destructive bg-destructive/10 p-2 text-xs text-destructive">
                  {availableUsersError}
                </div>
              )}

              <div className="max-h-80 overflow-y-auto space-y-3">
                {availableUsersLoading ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 加载中...
                  </div>
                ) : availableUsers.length > 0 ? (
                  availableUsers.map((user) => {
                    const alreadyInGroup = group?.userIds?.includes(user.id) ?? false
                    return (
                      <div
                        key={user.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{user.userId || user.deviceId}</p>
                          <p className="truncate text-xs text-muted-foreground">设备 ID：{user.deviceId}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddUser(user.id)}
                          disabled={alreadyInGroup || isMutating}
                        >
                          {alreadyInGroup ? "已在分组" : "添加至分组"}
                        </Button>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
                    {userSearch ? "未找到匹配的用户" : "暂无可添加的用户"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
