import { apiClient } from "./client";
import { API_PATHS } from "./config";
import type {
  ApiResponse,
  UpdateTask,
  PaginatedResponse,
  CreateUpdateTaskRequest,
  ListQueryParams,
} from "./types";

/**
 * 更新任务相关 API
 */
export const updateTasksApi = {
  /**
   * 获取更新任务列表
   */
  async getUpdateTasks(
    appId: string,
    params?: ListQueryParams & { status?: string }
  ): Promise<ApiResponse<PaginatedResponse<UpdateTask>>> {
    return apiClient.get<PaginatedResponse<UpdateTask>>(
      API_PATHS.apps.updateTasks(appId),
      params as Record<string, unknown>
    );
  },

  /**
   * 获取更新任务详情
   */
  async getUpdateTask(appId: string, id: string): Promise<ApiResponse<UpdateTask>> {
    return apiClient.get<UpdateTask>(API_PATHS.apps.updateTaskDetail(appId, id));
  },

  /**
   * 创建更新任务
   */
  async createUpdateTask(
    appId: string,
    data: CreateUpdateTaskRequest
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    return apiClient.post<{ id: string; status: string }>(
      API_PATHS.apps.updateTasks(appId),
      data
    );
  },
};

