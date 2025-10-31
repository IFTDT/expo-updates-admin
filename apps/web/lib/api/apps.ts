import { apiClient } from "./client";
import { API_PATHS } from "./config";
import type {
  ApiResponse,
  App,
  PaginatedResponse,
  AppListParams,
  CreateAppRequest,
  UpdateAppRequest,
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
};

