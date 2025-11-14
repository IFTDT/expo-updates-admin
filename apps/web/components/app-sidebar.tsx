"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Activity,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useAuth } from "@/lib/contexts/auth-context"

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

// 平台级别菜单（应用列表页等）
const platformNavItems: NavItem[] = [
  {
    title: "应用管理",
    href: "/apps",
    icon: LayoutDashboard,
  },
  {
    title: "用户管理",
    href: "/app-users",
    icon: Users,
  },
]

// 应用级别菜单（应用详情页等）
const getAppNavItems = (appId: string): NavItem[] => [
  {
    title: "概览",
    href: `/apps/${appId}`,
    icon: LayoutDashboard,
  },
  {
    title: "版本管理",
    href: `/apps/${appId}/versions`,
    icon: Package,
  },
  {
    title: "用户管理",
    href: `/apps/${appId}/users`,
    icon: Users,
  },
  {
    title: "统计分析",
    href: `/apps/${appId}/stats`,
    icon: BarChart3,
  },
  {
    title: "操作日志",
    href: `/apps/${appId}/logs`,
    icon: Activity,
  },
]

export function AppSidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // 判断是否在应用详情页或子页面
  const isAppDetailPage = pathname?.startsWith("/apps/") && pathname !== "/apps"

  // 提取 appId（如果在应用详情页）
  const appIdMatch = pathname?.match(/^\/apps\/([^/]+)/)
  const appId = appIdMatch ? appIdMatch[1] : null

  // 根据当前路径决定显示哪个菜单
  const navItems = isAppDetailPage && appId
    ? getAppNavItems(appId)
    : platformNavItems

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border",
          isCollapsed ? "w-16" : "w-64",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            <div
              className={cn(
                "flex items-center gap-2 transition-all w-full",
                isCollapsed && "justify-center"
              )}
            >
              {!isCollapsed ? (
                <div className="flex flex-col w-full">
                  {isAppDetailPage ? (
                    <>
                      <Link
                        href="/apps"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ← 返回应用列表
                      </Link>
                      <h1 className="text-lg font-semibold leading-tight">
                        {appId ? getAppNavItems(appId)[0]?.title || "应用管理" : "Expo Updates"}
                      </h1>
                    </>
                  ) : (
                    <h1 className="text-lg font-semibold">Expo Updates</h1>
                  )}
                </div>
              ) : (
                <h1 className="text-lg font-semibold">EU</h1>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-xs text-sidebar-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <Separator className="border-sidebar-border" />

          {/* User menu and Collapse button */}
          <div className="hidden border-t border-sidebar-border p-4 lg:flex lg:items-center lg:gap-2">
            <div className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/avatar.png"} alt="User" />
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">{user?.name || "用户名"}</span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email || "user@example.com"}
                          </span>
                        </div>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56"
                  side={isCollapsed ? "right" : "bottom"}
                >
                  <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>设置</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

