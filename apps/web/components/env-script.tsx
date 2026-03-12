/**
 * 在首屏注入运行时环境配置到 window.__ENV，供前端 API 客户端读取。
 * 便于同一 Docker 镜像通过 K8s 等在不同环境使用不同 API 地址（运行时设置 API_BASE_URL 即可）。
 */
import { headers } from "next/headers";

const DEFAULT_API_BASE_URL = "http://localhost:9999";

export function EnvScript() {
  // 强制该组件在请求时渲染，避免 build-time 静态化导致拿不到运行时环境变量
  headers();

  const apiBaseUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  const envJson = JSON.stringify({ apiBaseUrl });

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: [
          // 先注入一个初始值（如果 HTML 被缓存，这里可能是旧值）
          `window.__ENV=${envJson};`,
          // 再从 /api/config 拉取运行时配置覆盖，确保同一镜像多环境时一定正确
          `(function(){`,
          `  try {`,
          `    fetch('/api/config', { cache: 'no-store' })`,
          `      .then(function(r){ return r.ok ? r.json() : null; })`,
          `      .then(function(cfg){`,
          `        if (!cfg || !cfg.apiBaseUrl) return;`,
          `        window.__ENV = window.__ENV || {};`,
          `        window.__ENV.apiBaseUrl = cfg.apiBaseUrl;`,
          `      })`,
          `      .catch(function(){});`,
          `  } catch (e) {}`,
          `})();`,
        ].join(""),
      }}
    />
  );
}
