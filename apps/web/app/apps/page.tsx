import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Package, Activity, Users, ArrowRight } from "lucide-react"
import { AppLayout } from "@/components/app-layout"

// 模拟应用数据
const mockApps = [
  {
    id: "1",
    name: "购物 App",
    icon: "🛒",
    appId: "com.example.shopping",
    currentVersion: "1.2.0",
    status: "active" as const,
    lastUpdated: "2024-01-15",
    userCount: 1250,
    updateCount: 8,
  },
  {
    id: "2",
    name: "社交 App",
    icon: "💬",
    appId: "com.example.social",
    currentVersion: "2.0.1",
    status: "active" as const,
    lastUpdated: "2024-01-14",
    userCount: 3450,
    updateCount: 12,
  },
  {
    id: "3",
    name: "新闻 App",
    icon: "📰",
    appId: "com.example.news",
    currentVersion: "1.5.3",
    status: "active" as const,
    lastUpdated: "2024-01-13",
    userCount: 890,
    updateCount: 5,
  },
]

export default function AppsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">应用管理</h1>
            <p className="text-muted-foreground">
              管理您的 Expo 应用热更新
            </p>
          </div>
          <Button>添加应用</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总应用数</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockApps.length}</div>
              <p className="text-xs text-muted-foreground">
                全部正常运行
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockApps.reduce((sum, app) => sum + app.userCount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                活跃用户总数
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">更新次数</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockApps.reduce((sum, app) => sum + app.updateCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                本月发布次数
              </p>
            </CardContent>
          </Card>
        </div>

        {/* App List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockApps.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{app.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {app.appId}
                      </CardDescription>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      app.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {app.status === "active" ? "正常" : "异常"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">当前版本</span>
                    <span className="font-medium">{app.currentVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">用户数</span>
                    <span className="font-medium">
                      {app.userCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">更新时间</span>
                    <span className="font-medium">{app.lastUpdated}</span>
                  </div>
                </div>
                <Link href={`/apps/${app.id}`}>
                  <Button className="w-full" variant="outline">
                    进入管理
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

