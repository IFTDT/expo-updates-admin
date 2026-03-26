"use client";

import { AppLayout } from "@/components/app-layout";
import { appsApi } from "@/lib/api";
import type { App, UpdateAppRequest } from "@/lib/api/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Activity,
  Calendar,
  Package,
  Settings,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.appId as string;
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 设置对话框状态
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState<
    UpdateAppRequest & { icon?: string }
  >({
    name: "",
    icon: "",
  });
  const [settingsError, setSettingsError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 删除对话框状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchApp = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await appsApi.getApp(appId);

        if (response.success && response.data) {
          setApp(response.data);
        } else {
          setError(response.error?.message || "获取应用信息失败");
        }
      } catch (err) {
        setError("网络错误，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    if (appId) {
      fetchApp();
    }
  }, [appId]);

  // 处理打开设置对话框
  const openSettingsDialog = () => {
    if (app) {
      setSettingsFormData({
        name: app.name,
        icon: app.icon || "",
      });
      setSettingsError("");
      setIsSettingsDialogOpen(true);
    }
  };

  // 处理保存设置
  const handleSaveSettings = async () => {
    if (!app) return;

    if (!settingsFormData.name || settingsFormData.name.trim().length === 0) {
      setSettingsError("应用名称不能为空");
      return;
    }

    // 验证图标 URL（如果提供）
    if (settingsFormData.icon && settingsFormData.icon.trim() !== "") {
      // 如果输入的是URL，验证格式
      if (settingsFormData.icon.trim().startsWith("http")) {
        try {
          new URL(settingsFormData.icon.trim());
        } catch {
          setSettingsError("图标 URL 格式不正确");
          return;
        }
      }
    }

    setIsSaving(true);
    setSettingsError("");

    try {
      const updateData: UpdateAppRequest & { icon?: string } = {
        name: settingsFormData.name.trim(),
      };

      // 如果图标有变化，添加到更新数据中
      if (settingsFormData.icon !== undefined) {
        updateData.icon = settingsFormData.icon.trim() || undefined;
      }

      const response = await appsApi.updateApp(appId, updateData);

      if (response.success && response.data) {
        setIsSettingsDialogOpen(false);
        // 刷新应用信息
        const refreshResponse = await appsApi.getApp(appId);
        if (refreshResponse.success && refreshResponse.data) {
          setApp(refreshResponse.data);
        }
      } else {
        setSettingsError(response.error?.message || "更新应用失败");
      }
    } catch (err) {
      setSettingsError("更新应用失败，请稍后重试");
      console.error("更新应用错误:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理删除应用
  const handleDeleteApp = async () => {
    if (!app || !appId) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await appsApi.deleteApp(appId);

      if (response.success) {
        // 删除成功，跳转到应用列表页
        router.push("/apps");
      } else {
        // 处理各种错误情况
        const errorMessage = response.error?.message || "删除应用失败";
        setDeleteError(errorMessage);

        // 如果是权限错误，提供更详细的提示
        if (
          response.error?.code === "HTTP_403" ||
          response.error?.code?.includes("403")
        ) {
          setDeleteError("权限不足，无法删除该应用");
        }
      }
    } catch (err) {
      setDeleteError("删除应用失败，请稍后重试");
      console.error("删除应用错误:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !app) {
    return (
      <AppLayout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error || "应用不存在"}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/apps")}
            >
              返回应用列表
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <span className="text-4xl">{app.icon || "📱"}</span>
                {app.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {app.description || "暂无描述"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={openSettingsDialog}>
              <Settings className="mr-2 h-4 w-4" />
              设置
            </Button>
            <Link href={`/apps/${appId}/versions/new`}>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                新建版本
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">当前版本</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {app.currentVersion || "-"}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  共 {app.versions || 0} 个版本
                </p>
                <Link href={`/apps/${appId}/current-version`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                  >
                    选择版本
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {app.userCount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">活跃用户</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">更新次数</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{app.updateCount}</div>
              <p className="text-xs text-muted-foreground">总更新次数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">最后更新</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(app.updatedAt).toLocaleDateString("zh-CN", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(app.updatedAt).toLocaleDateString("zh-CN")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Overview Content */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>应用信息</CardTitle>
              <CardDescription>基本信息和配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">应用 ID</span>
                  <span className="text-sm font-medium">{app.appId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    创建时间
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(app.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">负责人</span>
                  <span className="text-sm font-medium">
                    {app.owner?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">状态</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      app.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {app.status === "active" ? "正常运行" : "异常"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
              <CardDescription>常用的管理操作</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/apps/${appId}/versions/new`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  新建版本
                </Button>
              </Link>
              <Link href={`/apps/${appId}/versions`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  查看所有版本
                </Button>
              </Link>
              <Link href={`/apps/${appId}/users`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  管理用户
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除应用
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 设置对话框 */}
        <Dialog
          open={isSettingsDialogOpen}
          onOpenChange={(open) => {
            setIsSettingsDialogOpen(open);
            if (!open) {
              setSettingsError("");
              if (app) {
                setSettingsFormData({
                  name: app.name,
                  icon: app.icon || "",
                });
              }
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>应用设置</DialogTitle>
              <DialogDescription>修改应用的基本信息</DialogDescription>
            </DialogHeader>
            {settingsError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {settingsError}
              </div>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="settings-name">应用名称 *</Label>
                <Input
                  id="settings-name"
                  value={settingsFormData.name}
                  onChange={(e) =>
                    setSettingsFormData({
                      ...settingsFormData,
                      name: e.target.value,
                    })
                  }
                  placeholder="例如：我的移动应用"
                  required
                />
                <p className="text-xs text-muted-foreground">应用的显示名称</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-icon">应用图标</Label>
                <Input
                  id="settings-icon"
                  type="text"
                  value={settingsFormData.icon || ""}
                  onChange={(e) =>
                    setSettingsFormData({
                      ...settingsFormData,
                      icon: e.target.value,
                    })
                  }
                  placeholder="输入 emoji 或图片 URL，例如：📱 或 https://example.com/icon.png"
                />
                <p className="text-xs text-muted-foreground">
                  支持 emoji 字符或图片 URL
                </p>
                {settingsFormData.icon && (
                  <div className="mt-2 p-2 border rounded-md bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">
                      预览：
                    </div>
                    <div className="text-4xl">
                      {settingsFormData.icon.trim().startsWith("http") ? (
                        <img
                          src={settingsFormData.icon.trim()}
                          alt="Icon preview"
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        settingsFormData.icon.trim() || "📱"
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSettingsDialogOpen(false)}
                disabled={isSaving}
              >
                取消
              </Button>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "保存中..." : "保存更改"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除应用确认对话框 */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            // 如果正在删除，不允许关闭对话框
            if (isDeleting && !open) {
              return;
            }
            setIsDeleteDialogOpen(open);
            if (!open) {
              setDeleteError("");
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除应用</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除应用 <strong>{app?.name}</strong> ({app?.appId}) 吗？
                <br />
                此操作将永久删除该应用及其所有版本、用户数据等，且无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {deleteError}
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteApp}
                disabled={isDeleting}
                variant="destructive"
              >
                {isDeleting ? "删除中..." : "删除"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
