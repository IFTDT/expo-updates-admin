import { apiClient } from "./client";
import { API_CONFIG, API_PATHS } from "./config";
import type {
  ApiResponse,
  Version,
  PaginatedResponse,
  VersionListParams,
  CreateVersionByUrlRequest,
  CreateVersionWithFilePayload,
  PublishVersionRequest,
  RollbackVersionRequest,
} from "./types";

/**
 * 版本相关 API
 */
export const versionsApi = {
  /**
   * 获取版本列表
   */
  async getVersions(
    appId: string,
    params?: VersionListParams
  ): Promise<ApiResponse<PaginatedResponse<Version>>> {
    return apiClient.get<PaginatedResponse<Version>>(API_PATHS.apps.versions(appId), params as Record<string, unknown>);
  },

  /**
   * 获取版本详情
   */
  async getVersion(appId: string, id: string): Promise<ApiResponse<Version>> {
    return apiClient.get<Version>(API_PATHS.apps.versionDetail(appId, id));
  },

  /**
   * 上传文件创建版本
   */
  async createVersionWithFile(
    appId: string,
    file: File,
    data: CreateVersionWithFilePayload
  ): Promise<ApiResponse<Version>> {
    const additionalData: Record<string, string> = {
      version: data.version,
      build: data.build,
      name: data.name,
      runtimeVersion: data.runtimeVersion,
      isMandatory: data.isMandatory ? "true" : "false",
      publishTime: data.publishTime ?? "now",
    };

    if (data.description) {
      additionalData.description = data.description;
    }

    if (data.scheduledAt) {
      additionalData.scheduledAt = data.scheduledAt;
    }

    return apiClient.upload<Version>(API_PATHS.apps.versions(appId), file, additionalData);
  },

  /**
   * 通过文件 URL 创建版本
   */
  async createVersionByUrl(
    appId: string,
    data: CreateVersionByUrlRequest
  ): Promise<ApiResponse<Version>> {
    return apiClient.post<Version>(API_PATHS.apps.versionCreateByUrl(appId), data);
  },

  /**
   * 删除版本
   */
  async deleteVersion(appId: string, id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(API_PATHS.apps.versionDetail(appId, id));
  },

  /**
   * 发布版本
   */
  async publishVersion(
    appId: string,
    id: string,
    data?: PublishVersionRequest
  ): Promise<ApiResponse<{ taskId: string; status: string; message?: string }>> {
    return apiClient.post<{ taskId: string; status: string; message?: string }>(
      API_PATHS.apps.versionPublish(appId, id),
      data
    );
  },

  /**
   * 回滚版本
   */
  async rollbackVersion(
    appId: string,
    id: string,
    data: RollbackVersionRequest
  ): Promise<ApiResponse<{ taskId: string; status: string; message?: string }>> {
    return apiClient.post<{ taskId: string; status: string; message?: string }>(
      API_PATHS.apps.versionRollback(appId, id),
      data
    );
  },

  /**
   * 下载版本文件
   */
  async downloadVersionFile(fileUrl: string): Promise<Blob> {
    if (!fileUrl) {
      throw new Error("文件下载地址不存在");
    }

    const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);
    const baseUrl = API_CONFIG.baseURL.replace(/\/+$/, "");

    // 相对路径，直接通过 API 客户端下载
    if (!/^https?:\/\//i.test(fileUrl)) {
      return apiClient.download(normalizePath(fileUrl));
    }

    // 绝对路径且与当前 API 基础地址相同，转换为相对路径以复用认证
    if (fileUrl.startsWith(baseUrl)) {
      const relativePath = fileUrl.slice(baseUrl.length);
      return apiClient.download(normalizePath(relativePath));
    }

    // 绝对路径且为外部地址，手动发起请求并附带认证信息
    const headers: Record<string, string> = {};
    const token = apiClient.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(fileUrl, { headers });
    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`);
    }

    return response.blob();
  },
};

