/**
 * 在首屏注入运行时环境配置到 window.__ENV，供前端 API 客户端读取。
 * 便于同一 Docker 镜像通过 K8s 等在不同环境使用不同 API 地址（运行时设置 API_BASE_URL 即可）。
 */
import { headers } from "next/headers";

const DEFAULT_API_BASE_URL = "http://localhost:9999";

function normalizeApiBaseUrl(raw: string | undefined): string {
  if (!raw) return DEFAULT_API_BASE_URL;
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_API_BASE_URL;

  // 兼容用户传入 //example.com（缺少协议）
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return trimmed;
}

export function EnvScript() {
  // 强制该组件在请求时渲染，避免 build-time 静态化导致拿不到运行时环境变量
  headers();

  const apiBaseUrl = normalizeApiBaseUrl(
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
  );

  const envJson = JSON.stringify({ apiBaseUrl });

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__ENV=${envJson};`,
      }}
    />
  );
}
