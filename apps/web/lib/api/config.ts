/**
 * API 配置
 */
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9999",
  timeout: 30000, // 30秒
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

