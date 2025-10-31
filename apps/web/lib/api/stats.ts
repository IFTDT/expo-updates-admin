import { apiClient } from "./client";
import { API_PATHS } from "./config";
import type {
  ApiResponse,
  Stats,
} from "./types";

/**
 * 统计相关 API
 */
export const statsApi = {
  /**
   * 获取应用统计信息
   */
  async getStats(
    appId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<Stats>> {
    return apiClient.get<Stats>(API_PATHS.apps.stats(appId), params);
  },

  /**
   * 获取版本分布
   */
  async getVersionDistribution(
    appId: string
  ): Promise<
    ApiResponse<
      Array<{
        version: string;
        count: number;
        percentage: number;
      }>
    >
  > {
    return apiClient.get<
      Array<{
        version: string;
        count: number;
        percentage: number;
      }>
    >(API_PATHS.apps.versionDistribution(appId));
  },

  /**
   * 获取更新成功率
   */
  async getUpdateSuccessRate(
    appId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<
    ApiResponse<{
      successRate: number;
      successCount: number;
      failureCount: number;
      totalCount: number;
    }>
  > {
    return apiClient.get<{
      successRate: number;
      successCount: number;
      failureCount: number;
      totalCount: number;
    }>(API_PATHS.apps.updateSuccessRate(appId), params);
  },
};

