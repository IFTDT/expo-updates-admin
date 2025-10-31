import { apiClient } from "./client";
import { API_PATHS } from "./config";
import type {
  ApiResponse,
  AppUser,
  PaginatedResponse,
  AppUserListParams,
  UpdateUserVersionRequest,
  BatchUpdateUsersRequest,
  RollbackVersionRequest,
} from "./types";

/**
 * 应用用户相关 API
 */
export const appUsersApi = {
  /**
   * 获取应用用户列表
   */
  async getAppUsers(
    appId: string,
    params?: AppUserListParams
  ): Promise<
    ApiResponse<
      PaginatedResponse<AppUser> & {
        stats: {
          total: number;
          online: number;
          offline: number;
          versions: number;
        };
      }
    >
  > {
    return apiClient.get<
      PaginatedResponse<AppUser> & {
        stats: {
          total: number;
          online: number;
          offline: number;
          versions: number;
        };
      }
    >(API_PATHS.apps.users(appId), params as Record<string, unknown>);
  },

  /**
   * 获取应用用户详情
   */
  async getAppUser(appId: string, id: string): Promise<ApiResponse<AppUser>> {
    return apiClient.get<AppUser>(API_PATHS.apps.userDetail(appId, id));
  },

  /**
   * 更新用户版本
   */
  async updateUserVersion(
    appId: string,
    id: string,
    data: UpdateUserVersionRequest
  ): Promise<ApiResponse<{ taskId: string; status: string }>> {
    return apiClient.post<{ taskId: string; status: string }>(
      API_PATHS.apps.userUpdate(appId, id),
      data
    );
  },

  /**
   * 批量更新用户
   */
  async batchUpdateUsers(
    appId: string,
    data: BatchUpdateUsersRequest
  ): Promise<ApiResponse<{ taskId: string; affectedCount: number }>> {
    return apiClient.post<{ taskId: string; affectedCount: number }>(
      API_PATHS.apps.userBatchUpdate(appId),
      data
    );
  },

  /**
   * 回滚用户版本
   */
  async rollbackUserVersion(
    appId: string,
    id: string,
    data: { toVersionId: string; reason?: string }
  ): Promise<ApiResponse<{ taskId: string }>> {
    return apiClient.post<{ taskId: string }>(
      API_PATHS.apps.userRollback(appId, id),
      data
    );
  },
};

