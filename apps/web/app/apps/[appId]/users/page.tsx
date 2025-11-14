"use client";

import { AppLayout } from "@/components/app-layout";
import { Pagination } from "@/components/pagination";
import { appUsersApi, appsApi } from "@/lib/api";
import type { App, AppUser } from "@/lib/api/types";
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
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Monitor,
  MoreVertical,
  Package,
  RefreshCw,
  Search,
  Smartphone,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function getPlatformIcon(platform?: string) {
  if (!platform) return null;
  return platform.toLowerCase() === "ios" ? (
    <Smartphone className="h-4 w-4 text-blue-600" />
  ) : (
    <Monitor className="h-4 w-4 text-green-600" />
  );
}

export default function UsersPage() {
  const params = useParams();
  const appId = params.appId as string;
  const [app, setApp] = useState<App | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    versions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [versionFilter, setVersionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

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

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await appUsersApi.getAppUsers(appId, {
        page,
        limit,
        search: search || undefined,
        version: versionFilter === "all" ? undefined : versionFilter,
        status:
          statusFilter === "all"
            ? undefined
            : (statusFilter as "online" | "offline" | undefined),
        platform:
          platformFilter === "all"
            ? undefined
            : (platformFilter as "ios" | "android" | undefined),
      });

      if (response.success && response.data) {
        setUsers(response.data.items);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } else {
        setError(response.error?.message || "获取用户列表失败");
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
      fetchUsers();
    }
  }, [appId, page, versionFilter, statusFilter, platformFilter]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchUsers();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  if (!app) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </AppLayout>
    );
  }

  const deviceInfoPlatform = (deviceInfo?: Record<string, unknown>) => {
    if (!deviceInfo) return undefined;
    return (deviceInfo.platform as string) || undefined;
  };

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
              <p className="text-muted-foreground mt-1">查看和管理应用的用户</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/apps/${appId}/users/groups`}>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                用户分组
              </Button>
            </Link>
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
            <CardDescription>共 {total} 个用户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户 ID 或设备 ID..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="筛选平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有平台</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                      <TableHead>用户 ID</TableHead>
                      <TableHead>设备 ID</TableHead>
                      <TableHead>平台</TableHead>
                      <TableHead>当前版本</TableHead>
                      <TableHead>最后更新</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          暂无用户数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.userId || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {user.deviceId}
                          </TableCell>
                          <TableCell>{user.platform}</TableCell>
                          <TableCell>
                            {user.currentVersion ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Package className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">
                                    {user.currentVersion.version}<span className="text-xs text-muted-foreground space-y-0.5">(运行时: {user.currentVersion.runtimeVersion})</span>
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-0.5">
                                  <div>构建: {user.currentVersion.build}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.lastUpdateAt ? (
                              <div className="space-y-1">
                                <div>
                                  {new Date(
                                    user.lastUpdateAt,
                                  ).toLocaleDateString("zh-CN")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(
                                    user.lastUpdateAt,
                                  ).toLocaleTimeString("zh-CN")}
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
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/apps/${appId}/users/${user.id}/version`}
                                  >
                                    <Package className="mr-2 h-4 w-4" />
                                    更新到指定版本
                                  </Link>
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
      </div>
    </AppLayout>
  );
}
