import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { AppLayout } from "@/components/app-layout"
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react"

// 模拟应用数据
const getAppData = (appId: string) => {
  const apps = {
    "1": { id: "1", name: "购物 App", icon: "🛒" },
    "2": { id: "2", name: "社交 App", icon: "💬" },
    "3": { id: "3", name: "新闻 App", icon: "📰" },
  }
  return apps[appId as keyof typeof apps]
}

// 模拟统计数据
const getStats = (appId: string) => {
  return {
    versionDistribution: [
      { version: "1.2.0", count: 850, percentage: 68 },
      { version: "1.1.9", count: 280, percentage: 22.4 },
      { version: "1.1.8", count: 120, percentage: 9.6 },
    ],
    updateSuccessRate: {
      success: 1240,
      failed: 10,
      rate: 99.2,
    },
    updateTimeline: [
      { date: "2024-01-15", count: 450 },
      { date: "2024-01-14", count: 320 },
      { date: "2024-01-13", count: 280 },
      { date: "2024-01-12", count: 200 },
      { date: "2024-01-11", count: 180 },
    ],
    failureReasons: [
      { reason: "网络超时", count: 5 },
      { reason: "存储空间不足", count: 3 },
      { reason: "版本不兼容", count: 2 },
    ],
  }
}

interface StatsPageProps {
  params: Promise<{ appId: string }>
}

export default async function StatsPage({ params }: StatsPageProps) {
  const { appId } = await params
  const app = getAppData(appId)
  const stats = getStats(appId)

  if (!app) {
    notFound()
  }

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
              <CardTitle className="text-sm font-medium">
                更新成功率
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.updateSuccessRate.rate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                成功 {stats.updateSuccessRate.success} / 失败{" "}
                {stats.updateSuccessRate.failed}
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
                {stats.versionDistribution.length}
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
                {stats.updateTimeline.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                最近 5 天更新次数
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
                          {item.percentage}%
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
                        {stats.updateSuccessRate.success} 次
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {stats.updateSuccessRate.rate}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">失败</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.updateSuccessRate.failed} 次
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {(
                      (stats.updateSuccessRate.failed /
                        (stats.updateSuccessRate.success +
                          stats.updateSuccessRate.failed)) *
                      100
                    ).toFixed(1)}
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
              <CardDescription>最近 5 天的更新次数</CardDescription>
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
                            width: `${
                              (item.count /
                                Math.max(
                                  ...stats.updateTimeline.map((i) => i.count)
                                )) *
                              100
                            }%`,
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
                {stats.failureReasons.map((item, index) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

