"use client"

import { AppSidebar } from "./app-sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto pt-16 lg:pl-64 lg:pt-0 transition-all duration-300">
        <div className="container mx-auto p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

