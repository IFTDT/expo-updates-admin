/**
 * API 响应基础类型
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 错误响应
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * 用户信息
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  appIds?: string[];
  status?: string;
  createdAt?: string;
  lastLoginAt?: string | null;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

/**
 * 应用信息
 */
export interface App {
  id: string;
  name: string;
  appId: string;
  icon?: string | null;
  description?: string | null;
  status: string;
  currentVersion?: string | null;
  userCount: number;
  updateCount: number;
  versions?: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email?: string;
  };
}

/**
 * 版本信息
 */
export interface Version {
  id: string;
  version: string;
  build: string;
  name: string;
  runtimeVersion?: string | null;
  description?: string | null;
  status: string;
  fileUrl: string;
  fileSize: number;
  checksum: string;
  isMandatory: boolean;
  publishedAt?: string | null;
  rolledBackAt?: string | null;
  publishedBy?: string | null;
  publisher?: {
    id: string;
    name: string;
  };
  userCount: number;
  createdAt: string;
  taskId?: string;
}

/**
 * 更新任务
 */
export interface UpdateTask {
  id: string;
  appId: string;
  versionId: string;
  version?: {
    id: string;
    version: string;
  };
  type: string;
  status: string;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  successCount: number;
  failureCount: number;
  progress?: number;
  details?: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
}

/**
 * 应用用户
 */
export interface AppUser {
  id: string;
  deviceId: string;
  userId?: string | null;
  currentVersion?: string | null;
  lastUpdateAt?: string | null;
  deviceInfo?: Record<string, unknown>;
  status: string;
  updateHistory?: Array<{
    version: string;
    updatedAt: string;
    status: string;
  }>;
}

/**
 * 用户分组
 */
export interface UserGroup {
  id: string;
  name: string;
  description?: string | null;
  userCount: number;
  userIds: string[];
  users?: Array<{
    id: string;
    userId?: string | null;
    deviceId: string;
  }>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/**
 * 日志
 */
export interface Log {
  id: string;
  type: string;
  action: string;
  targetId?: string | null;
  targetType?: string | null;
  status: string;
  details?: Record<string, unknown>;
  userId: string;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
  createdAt: string;
}

/**
 * 统计信息
 */
export interface Stats {
  summary: {
    updateSuccessRate: number;
    successCount: number;
    failureCount: number;
    activeVersions: number;
    totalUpdates: number;
  };
  versionDistribution: Array<{
    version: string;
    count: number;
    percentage: number;
  }>;
  updateTimeline: Array<{
    date: string;
    count: number;
  }>;
  failureReasons: Array<{
    reason: string;
    count: number;
  }>;
}

/**
 * 上传信息
 */
export interface UploadResponse {
  fileUrl: string;
  fileSize: number;
  checksum: string;
  uploadId: string;
}

/**
 * 上传进度
 */
export interface UploadProgress {
  uploadId: string;
  progress: number;
  status: string;
  uploadedBytes: number;
  totalBytes: number;
}

/**
 * 查询参数
 */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
}

/**
 * 应用列表查询参数
 */
export interface AppListParams extends ListQueryParams {
  status?: "active" | "inactive";
}

/**
 * 版本列表查询参数
 */
export interface VersionListParams extends ListQueryParams {
  status?: "draft" | "published" | "rolled_back";
}

/**
 * 用户列表查询参数
 */
export interface AppUserListParams extends ListQueryParams {
  version?: string;
  status?: "online" | "offline";
  platform?: "ios" | "android";
}

/**
 * 日志查询参数
 */
export interface LogListParams extends ListQueryParams {
  type?: string;
  status?: "success" | "failed";
  userId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 创建应用请求
 */
export interface CreateAppRequest {
  name: string;
  appId: string;
  description?: string;
  icon?: string;
}

/**
 * 更新应用请求
 */
export interface UpdateAppRequest {
  name?: string;
  description?: string;
  status?: "active" | "inactive";
}

/**
 * 通过文件上传创建版本所需字段
 */
export interface CreateVersionWithFilePayload {
  version: string;
  build: string;
  name: string;
  runtimeVersion: string;
  description?: string;
  isMandatory?: boolean;
  publishTime?: "now" | "scheduled";
  scheduledAt?: string;
}

/**
 * 通过文件 URL 创建版本请求
 */
export interface CreateVersionByUrlRequest {
  version: string;
  build: string;
  name: string;
  description?: string;
  runtimeVersion?: string;
  isMandatory?: boolean;
  fileUrl: string;
  fileSize: number;
  checksum: string;
  publishTime?: "now" | "scheduled";
  scheduledAt?: string;
}

/**
 * 发布版本请求
 */
export interface PublishVersionRequest {
  type?: "full" | "targeted";
  targetUserIds?: string[];
  targetGroupIds?: string[];
  scheduledAt?: string | null;
}

/**
 * 回滚版本请求
 */
export interface RollbackVersionRequest {
  toVersionId: string;
  type?: "full" | "targeted";
  reason?: string;
  targetUserIds?: string[];
  targetGroupIds?: string[];
}

/**
 * 创建更新任务请求
 */
export interface CreateUpdateTaskRequest {
  versionId: string;
  type?: "full" | "targeted";
  targetUserIds?: string[];
  targetGroupIds?: string[];
  scheduledAt?: string | null;
}

/**
 * 更新用户版本请求
 */
export interface UpdateUserVersionRequest {
  versionId: string;
  force?: boolean;
}

/**
 * 批量更新用户请求
 */
export interface BatchUpdateUsersRequest {
  userIds: string[];
  versionId: string;
}

/**
 * 创建用户分组请求
 */
export interface CreateUserGroupRequest {
  name: string;
  description?: string;
  userIds?: string[];
}

/**
 * 更新用户分组请求
 */
export interface UpdateUserGroupRequest {
  name?: string;
  description?: string;
  userIds?: string[];
}

/**
 * 创建平台用户请求
 */
export interface CreatePlatformUserRequest {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "app_manager" | "viewer";
  appIds?: string[];
}

/**
 * 更新平台用户请求
 */
export interface UpdatePlatformUserRequest {
  name?: string;
  role?: "admin" | "app_manager" | "viewer";
  status?: "active" | "inactive";
  appIds?: string[];
}

