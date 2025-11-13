import { apiClient } from "./client";
import { API_PATHS } from "./config";
import type {
  ApiResponse,
  App,
  PaginatedResponse,
  AppListParams,
  CreateAppRequest,
  UpdateAppRequest,
  SetAppCurrentVersionRequest,
  SetVersionResponse,
} from "./types";

/**
 * 应用相关 API
 */
export const appsApi = {
  /**
   * 获取应用列表
   */
  async getApps(params?: AppListParams): Promise<ApiResponse<PaginatedResponse<App>>> {
    return apiClient.get<PaginatedResponse<App>>(API_PATHS.apps.list, params as Record<string, unknown>);
  },

  /**
   * 获取应用详情
   */
  async getApp(id: string): Promise<ApiResponse<App>> {
    return apiClient.get<App>(API_PATHS.apps.detail(id));
  },

  /**
   * 创建应用
   */
  async createApp(data: CreateAppRequest): Promise<ApiResponse<App>> {
    return apiClient.post<App>(API_PATHS.apps.list, data);
  },

  /**
   * 更新应用
   */
  async updateApp(id: string, data: UpdateAppRequest): Promise<ApiResponse<App>> {
    return apiClient.put<App>(API_PATHS.apps.detail(id), data);
  },

  /**
   * 删除应用
   * @param id 应用 ID
   * @returns 删除结果，成功时 data 为 null，message 包含成功消息
   */
  async deleteApp(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(API_PATHS.apps.detail(id));
  },

  /**
   * 设置应用当前版本
   * @param id 应用 ID
   * @param data 设置版本请求
   * @returns 设置结果
   */
  async setCurrentVersion(
    id: string,
    data: SetAppCurrentVersionRequest
  ): Promise<ApiResponse<SetVersionResponse>> {
    return apiClient.put<SetVersionResponse>(API_PATHS.apps.appCurrentVersion(id), data);
  },
};

