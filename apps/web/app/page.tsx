import { redirect } from "next/navigation"

export default function Page() {
  // TODO: 检查登录状态，如果未登录重定向到登录页，如果已登录重定向到应用列表页
  // 目前暂时重定向到应用列表页
  redirect("/apps")
}
