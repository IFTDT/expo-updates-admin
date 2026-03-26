/**
 * API 配置
 * - 优先使用运行时配置：浏览器端从 window.__ENV.apiBaseUrl 读取（由服务端在首屏注入），服务端从 process.env.API_BASE_URL 读取
 * - 其次使用构建时环境变量 NEXT_PUBLIC_API_BASE_URL（兼容旧部署方式）
 * - 默认 http://localhost:9999
 */
const DEFAULT_API_BASE_URL = "http://10.2.0.68:9998";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.__ENV?.apiBaseUrl ?? DEFAULT_API_BASE_URL;
  }
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL
  );
}

export const API_CONFIG = {
  get baseURL(): string {
    return getApiBaseUrl();
  },
  timeout: 60 * 1000, // 60秒
} as const;

/**
 * API 路径常量
 */
export const API_PATHS = {
  // 认证
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    me: "/api/auth/me",
  },
  // 应用
  apps: {
    list: "/api/apps",
    detail: (id: string) => `/api/apps/${id}`,
    versions: (appId: string) => `/api/apps/${appId}/versions`,
    versionCreateByUrl: (appId: string) => `/api/apps/${appId}/versions/by-url`,
    versionDetail: (appId: string, id: string) => `/api/apps/${appId}/versions/${id}`,
    versionPublish: (appId: string, id: string) => `/api/apps/${appId}/versions/${id}/publish`,
    versionRollback: (appId: string, id: string) => `/api/apps/${appId}/versions/${id}/rollback`,
    updateTasks: (appId: string) => `/api/apps/${appId}/update-tasks`,
    updateTaskDetail: (appId: string, id: string) => `/api/apps/${appId}/update-tasks/${id}`,
    users: (appId: string) => `/api/apps/${appId}/users`,
    userDetail: (appId: string, id: string) => `/api/apps/${appId}/users/${id}`,
    userUpdate: (appId: string, id: string) => `/api/apps/${appId}/users/${id}/update`,
    userBatchUpdate: (appId: string) => `/api/apps/${appId}/users/batch-update`,
    userRollback: (appId: string, id: string) => `/api/apps/${appId}/users/${id}/rollback`,
    userGroups: (appId: string) => `/api/apps/${appId}/user-groups`,
    userGroupDetail: (appId: string, id: string) => `/api/apps/${appId}/user-groups/${id}`,
    userGroupUsers: (appId: string, id: string) => `/api/apps/${appId}/user-groups/${id}/users`,
    userGroupTargetVersion: (appId: string, id: string) => `/api/apps/${appId}/user-groups/${id}/target-version`,
    userTargetVersion: (appId: string, id: string) => `/api/apps/${appId}/users/${id}/target-version`,
    appCurrentVersion: (id: string) => `/api/apps/${id}/current-version`,
    logs: (appId: string) => `/api/apps/${appId}/logs`,
    logDetail: (appId: string, id: string) => `/api/apps/${appId}/logs/${id}`,
    logExport: (appId: string) => `/api/apps/${appId}/logs/export`,
    stats: (appId: string) => `/api/apps/${appId}/stats`,
    versionDistribution: (appId: string) => `/api/apps/${appId}/stats/version-distribution`,
    updateSuccessRate: (appId: string) => `/api/apps/${appId}/stats/update-success-rate`,
  },
  // 平台用户
  users: {
    list: "/api/users",
    detail: (id: string) => `/api/users/${id}`,
    resetPassword: (id: string) => `/api/users/${id}/reset-password`,
    toggleStatus: (id: string) => `/api/users/${id}/toggle-status`,
  },
  // 上传
  upload: {
    upload: "/api/upload",
    progress: (uploadId: string) => `/api/upload/${uploadId}/progress`,
  },
} as const;
