# API 客户端使用文档

## 概述

本模块提供了完整的后端 API 调用功能，基于 OpenAPI 规范实现。所有 API 调用都通过统一的客户端进行，支持认证、错误处理和类型安全。

## 基础配置

API 基础地址配置在 `config.ts` 中：

```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9999",
  timeout: 30000, // 30秒
};
```

可以通过环境变量 `NEXT_PUBLIC_API_BASE_URL` 来配置后端地址。

## 使用方式

### 1. 导入 API 模块

```typescript
import { authApi, appsApi, versionsApi } from "@/lib/api";
```

### 2. 认证相关

```typescript
// 登录
const loginResponse = await authApi.login("user@example.com", "password123");
if (loginResponse.success) {
  // 登录成功，token 已自动保存
  console.log(loginResponse.data.user);
}

// 获取当前用户
const userResponse = await authApi.getCurrentUser();
if (userResponse.success) {
  console.log(userResponse.data);
}

// 刷新 Token
const refreshResponse = await authApi.refreshToken();

// 登出
await authApi.logout(); // 会自动清除 token
```

### 3. 应用管理

```typescript
// 获取应用列表
const appsResponse = await appsApi.getApps({
  page: 1,
  limit: 20,
  status: "active",
  search: "关键词",
});

if (appsResponse.success) {
  console.log(appsResponse.data.items);
  console.log(appsResponse.data.pagination);
}

// 获取应用详情
const appResponse = await appsApi.getApp("app-id");
if (appResponse.success) {
  console.log(appResponse.data);
}

// 创建应用
const createResponse = await appsApi.createApp({
  name: "我的应用",
  appId: "com.example.app",
  description: "应用描述",
});

// 更新应用
const updateResponse = await appsApi.updateApp("app-id", {
  name: "新名称",
  status: "active",
});
```

### 4. 版本管理

```typescript
// 获取版本列表
const versionsResponse = await versionsApi.getVersions("app-id", {
  page: 1,
  limit: 20,
  status: "published",
});

// 创建版本
const createVersionResponse = await versionsApi.createVersion("app-id", {
  version: "1.0.0",
  name: "版本名称",
  description: "版本描述",
  fileUrl: "https://example.com/update.tar.gz",
  fileSize: 1024000,
  checksum: "sha256:abc123...",
  isMandatory: false,
});

// 发布版本
const publishResponse = await versionsApi.publishVersion("app-id", "version-id", {
  type: "full",
  scheduledAt: "2024-01-20T10:00:00Z",
});

// 回滚版本
const rollbackResponse = await versionsApi.rollbackVersion("app-id", "version-id", {
  toVersionId: "previous-version-id",
  reason: "回滚原因",
});
```

### 5. 用户管理

```typescript
// 获取应用用户列表
const usersResponse = await appUsersApi.getAppUsers("app-id", {
  page: 1,
  limit: 20,
  status: "online",
});

// 更新用户版本
const updateUserResponse = await appUsersApi.updateUserVersion("app-id", "user-id", {
  versionId: "version-id",
  force: false,
});

// 批量更新用户
const batchUpdateResponse = await appUsersApi.batchUpdateUsers("app-id", {
  userIds: ["user1", "user2"],
  versionId: "version-id",
});
```

### 6. 文件上传

```typescript
// 上传文件
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const uploadResponse = await uploadApi.uploadFile(file, "app-id");
if (uploadResponse.success) {
  console.log(uploadResponse.data.fileUrl);
  console.log(uploadResponse.data.uploadId);
}

// 查询上传进度
const progressResponse = await uploadApi.getUploadProgress("upload-id");
if (progressResponse.success) {
  console.log(`上传进度: ${progressResponse.data.progress}%`);
}
```

### 7. 日志导出

```typescript
// 导出日志
const blob = await logsApi.exportLogs("app-id", {
  format: "csv",
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-01-31T23:59:59Z",
});

// 下载文件
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "logs.csv";
a.click();
URL.revokeObjectURL(url);
```

## 错误处理

所有 API 调用都返回统一的响应格式：

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

错误处理示例：

```typescript
const response = await appsApi.getApps();

if (!response.success) {
  if (response.error) {
    switch (response.error.code) {
      case "AUTH_EXPIRED":
        // Token 过期，尝试刷新
        await authApi.refreshToken();
        break;
      case "PERMISSION_DENIED":
        // 权限不足
        console.error("权限不足");
        break;
      default:
        console.error(response.error.message);
    }
  }
}
```

## 类型安全

所有 API 调用都提供了完整的 TypeScript 类型定义，包括：

- 请求参数类型
- 响应数据类型
- 错误类型

使用 TypeScript 可以获得完整的类型提示和编译时检查。

## Token 管理

Token 的存储和管理由 API 客户端自动处理：

- 登录成功后自动保存 `accessToken` 和 `refreshToken`
- 所有请求自动携带 `Authorization` 头
- 登出时自动清除 Token

可以通过 `apiClient.setAccessToken()` 手动设置 Token，或通过 `apiClient.getAccessToken()` 获取当前 Token。

## API 模块列表

- `authApi` - 认证相关
- `appsApi` - 应用管理
- `versionsApi` - 版本管理
- `updateTasksApi` - 更新任务
- `appUsersApi` - 应用用户
- `userGroupsApi` - 用户分组
- `logsApi` - 日志
- `statsApi` - 统计
- `platformUsersApi` - 平台用户
- `uploadApi` - 文件上传

## 注意事项

1. 所有需要认证的接口会自动携带 Token，无需手动处理
2. Token 存储在 `localStorage` 中，刷新页面后会自动恢复
3. 文件上传使用 `multipart/form-data` 格式
4. 导出功能返回 `Blob` 对象，需要手动处理下载
5. 所有时间参数使用 ISO 8601 格式字符串

