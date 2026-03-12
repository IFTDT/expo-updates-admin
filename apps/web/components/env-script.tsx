/**
 * 在首屏注入运行时环境配置到 window.__ENV，供前端 API 客户端读取。
 * 便于同一 Docker 镜像通过 K8s 等在不同环境使用不同 API 地址（运行时设置 API_BASE_URL 即可）。
 */
export function EnvScript() {
  const apiBaseUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:9999";

  const envJson = JSON.stringify({ apiBaseUrl });

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__ENV=${envJson};`,
      }}
    />
  );
}
