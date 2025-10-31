import { apiClient } from "./client";
import { API_PATHS } from "./config";
import type {
  ApiResponse,
  Log,
  PaginatedResponse,
  LogListParams,
} from "./types";

/**
 * 日志相关 API
 */
export const logsApi = {
  /**
   * 获取日志列表
   */
  async getLogs(
    appId: string,
    params?: LogListParams
  ): Promise<ApiResponse<PaginatedResponse<Log>>> {
    return apiClient.get<PaginatedResponse<Log>>(API_PATHS.apps.logs(appId), params as Record<string, unknown>);
  },

  /**
   * 获取日志详情
   */
  async getLog(appId: string, id: string): Promise<ApiResponse<Log>> {
    return apiClient.get<Log>(API_PATHS.apps.logDetail(appId, id));
  },

  /**
   * 导出日志
   */
  async exportLogs(
    appId: string,
    params?: {
      format?: "csv" | "xlsx";
      type?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Blob> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const url = queryString
      ? `${API_PATHS.apps.logExport(appId)}?${queryString}`
      : API_PATHS.apps.logExport(appId);

    return apiClient.download(url);
  },
};

