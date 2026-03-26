"use client";

import { AppLayout } from "@/components/app-layout";
import { Pagination } from "@/components/pagination";
import { appsApi, versionsApi } from "@/lib/api";
import type { App, Version } from "@/lib/api/types";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Loader2, MoreVertical, Package, Pin, Star, Upload } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/** 是否为应用当前对外版本（优先用 currentVersionId，否则回退比较版本号字符串） */
function isAppCurrentVersion(
  app: App | null,
  version: Version,
): boolean {
  if (!app) return false;
  if (app.currentVersionId != null && app.currentVersionId !== "") {
    return app.currentVersionId === version.id;
  }
  return (
    app.currentVersion != null &&
    app.currentVersion !== "" &&
    app.currentVersion === version.version
  );
}

type ActionMessage = {
  type: "success" | "error";
  message: string;
};

export default function VersionsPage() {
  const params = useParams();
  const appId = params.appId as string;
  const [app, setApp] = useState<App | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(
    null,
  );
  const [settingCurrentVersionId, setSettingCurrentVersionId] = useState<
    string | null
  >(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVersionForDelete, setSelectedVersionForDelete] =
    useState<Version | null>(null);
  const [deletingVersionId, setDeletingVersionId] = useState<string | null>(
    null,
  );

  const fetchApp = async () => {
    try {
      const response = await appsApi.getApp(appId);
      if (response.success && response.data) {
        setApp(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch app:", err);
    }
  };

  const fetchVersions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await versionsApi.getVersions(appId, {
        page,
        limit,
      });

      if (response.success && response.data) {
        setVersions(response.data.items);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.error?.message || "获取版本列表失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appId) {
      fetchApp();
    }
  }, [appId]);

  useEffect(() => {
    if (appId) {
      fetchVersions();
    }
  }, [appId, page]);

  const handleSetAsCurrentVersion = async (version: Version) => {
    if (!appId) return;
    if (isAppCurrentVersion(app, version)) {
      return;
    }

    setSettingCurrentVersionId(version.id);
    setActionMessage(null);

    try {
      const response = await appsApi.setCurrentVersion(appId, {
        versionId: version.id,
      });
      if (response.success) {
        setActionMessage({
          type: "success",
          message: `已将当前应用版本设为 ${version.version}`,
        });
        await fetchApp();
      } else {
        setActionMessage({
          type: "error",
          message: response.error?.message || "设置当前版本失败",
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "设置当前版本失败，请稍后重试";
      console.error("设置当前版本失败:", err);
      setActionMessage({
        type: "error",
        message,
      });
    } finally {
      setSettingCurrentVersionId(null);
    }
  };

  const handleDeleteMenuSelect = (version: Version) => {
    setSelectedVersionForDelete(version);
    setShowDeleteDialog(true);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open && deletingVersionId !== null) {
      return;
    }
    setShowDeleteDialog(open);
    if (!open) {
      setSelectedVersionForDelete(null);
    }
  };

  const handleDeleteVersion = async () => {
    if (!selectedVersionForDelete) {
      return;
    }

    setDeletingVersionId(selectedVersionForDelete.id);
    setActionMessage(null);

    try {
      const response = await versionsApi.deleteVersion(
        appId,
        selectedVersionForDelete.id,
      );
      if (response.success) {
        setActionMessage({
          type: "success",
          message: `版本 ${selectedVersionForDelete.version} 已删除`,
        });
        setShowDeleteDialog(false);
        setSelectedVersionForDelete(null);
        await fetchVersions();
      } else {
        throw new Error(response.error?.message || "删除版本失败");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "删除版本失败，请稍后重试";
      console.error("删除版本失败:", err);
      setActionMessage({
        type: "error",
        message,
      });
    } finally {
      setDeletingVersionId(null);
    }
  };

  if (!app) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
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
              新建版本
            </Button>
          </Link>
        </div>

        {/* Versions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>版本列表</CardTitle>
                <CardDescription className="space-y-1">
                  <span>共 {total} 个版本</span>
                  <span className="block">
                    当前应用版本：
                    {app.currentVersion ? (
                      <span className="font-medium text-foreground">
                        {app.currentVersion}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">未设置</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Star
                      className="h-3.5 w-3.5 shrink-0 fill-primary text-primary"
                      aria-hidden
                    />
                    表示当前应用版本
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
            {actionMessage && (
              <div
                className={`mb-4 rounded border px-3 py-2 text-sm ${
                  actionMessage.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-300"
                    : "border-destructive bg-destructive/10 text-destructive"
                }`}
              >
                {actionMessage.message}
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
                      <TableHead>版本号</TableHead>
                      <TableHead>构建版本</TableHead>
                      <TableHead>运行时版本</TableHead>
                      <TableHead>版本名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>文件大小</TableHead>
                      <TableHead>用户数</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>上传者</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          className="text-center py-8 text-muted-foreground"
                        >
                          暂无版本数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      versions.map((version) => {
                        const isCurrent = isAppCurrentVersion(app, version);
                        return (
                        <TableRow
                          key={version.id}
                          className={
                            isCurrent ? "bg-primary/[0.06] dark:bg-primary/10" : undefined
                          }
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span>{version.version}</span>
                              {isCurrent && (
                                <span
                                  title="当前应用版本"
                                  aria-label="当前应用版本"
                                >
                                  <Star
                                    className="h-4 w-4 shrink-0 fill-primary text-primary"
                                    aria-hidden
                                  />
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{version.build || "-"}</TableCell>
                          <TableCell>{version.runtimeVersion || "-"}</TableCell>
                          <TableCell>{version.name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {version.description || "-"}
                          </TableCell>
                          <TableCell>
                            {formatFileSize(version.fileSize)}
                          </TableCell>
                          <TableCell>
                            {version.userCount ?? 0}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div>
                                {new Date(
                                  version.createdAt,
                                ).toLocaleDateString("zh-CN")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(
                                  version.createdAt,
                                ).toLocaleTimeString("zh-CN")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {version.publisher?.name ||
                              version.publishedBy ||
                              "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() =>
                                    void handleSetAsCurrentVersion(version)
                                  }
                                  disabled={
                                    isCurrent ||
                                    settingCurrentVersionId === version.id
                                  }
                                  title={
                                    isCurrent ? "已是当前应用版本" : undefined
                                  }
                                >
                                  {settingCurrentVersionId === version.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Pin className="mr-2 h-4 w-4" />
                                  )}
                                  {settingCurrentVersionId === version.id
                                    ? "设置中..."
                                    : isCurrent
                                      ? "已是当前版本"
                                      : "设为当前应用版本"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        );
                      })
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
  );
}
