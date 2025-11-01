"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { AppLayout } from "@/components/app-layout"
import {
  TrendingUp,
  Package,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { appsApi, statsApi } from "@/lib/api"
import type { App, Stats } from "@/lib/api/types"

export default function StatsPage() {
  const params = useParams()
  const appId = params.appId as string
  const [app, setApp] = useState<App | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  const fetchStats = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await statsApi.getStats(appId)
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        setError(response.error?.message || "获取统计数据失败")
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
      fetchStats()
    }
  }, [appId])

  if (!app) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </AppLayout>
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </AppLayout>
    )
  }

  if (error || !stats) {
    return (
      <AppLayout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              {error || "获取统计数据失败"}
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  const maxCount = Math.max(...stats.updateTimeline.map((i) => i.count), 1)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {app.name} - 统计分析
              </h1>
              <p className="text-muted-foreground mt-1">
                查看应用的更新统计和分析数据
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">更新成功率</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.summary.updateSuccessRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                成功 {stats.summary.successCount} / 失败 {stats.summary.failureCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃版本数</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.summary.activeVersions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                当前运行的版本数
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总更新次数</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.summary.totalUpdates}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                总更新次数
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Version Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>版本分布</CardTitle>
              <CardDescription>各版本用户数量统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.versionDistribution.map((item) => (
                  <div key={item.version} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.version}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {item.count} 用户
                        </span>
                        <span className="text-sm font-medium">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Update Success Rate */}
          <Card>
            <CardHeader>
              <CardTitle>更新成功率</CardTitle>
              <CardDescription>成功与失败的数量统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">成功</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.summary.successCount} 次
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {stats.summary.updateSuccessRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">失败</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.summary.failureCount} 次
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {stats.summary.totalUpdates > 0
                      ? (
                          (stats.summary.failureCount / stats.summary.totalUpdates) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>更新时间分布</CardTitle>
              <CardDescription>最近更新时间统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.updateTimeline.map((item) => (
                  <div key={item.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("zh-CN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-secondary rounded-full h-4 relative">
                        <div
                          className="bg-primary h-4 rounded-full transition-all flex items-center justify-end pr-2"
                          style={{
                            width: `${(item.count / maxCount) * 100}%`,
                          }}
                        >
                          <span className="text-xs font-medium text-primary-foreground">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Failure Reasons */}
          <Card>
            <CardHeader>
              <CardTitle>失败原因分析</CardTitle>
              <CardDescription>更新失败的原因统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.failureReasons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无失败记录</p>
                ) : (
                  stats.failureReasons.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.count} 次
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {item.count}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
