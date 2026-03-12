/**
 * 运行时环境配置（由服务端注入到 window.__ENV，便于同一镜像多环境部署）
 */
declare global {
  interface Window {
    __ENV?: {
      apiBaseUrl?: string;
    };
  }
}

export {};
