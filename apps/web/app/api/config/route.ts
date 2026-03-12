import { NextResponse } from "next/server";

const DEFAULT_API_BASE_URL = "http://localhost:9999";

/**
 * 返回运行时 API 配置，供需要动态获取 baseURL 的场景使用（如非 React 脚本）。
 * 浏览器端更推荐直接使用首屏注入的 window.__ENV。
 */
export async function GET() {
  const apiBaseUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  return NextResponse.json({ apiBaseUrl });
}
