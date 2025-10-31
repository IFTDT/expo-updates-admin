import { apiClient } from "./client";
import { API_PATHS } from "./config";
import type {
  ApiResponse,
  User,
  PaginatedResponse,
  CreatePlatformUserRequest,
  UpdatePlatformUserRequest,
  ListQueryParams,
} from "./types";

/**
 * 平台用户相关 API
 */
export const platformUsersApi = {
  /**
   * 获取平台用户列表
   */
  async getUsers(
    params?: ListQueryParams & {
      search?: string;
      role?: string;
      status?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    return apiClient.get<PaginatedResponse<User>>(API_PATHS.users.list, params as Record<string, unknown>);
  },

  /**
   * 创建平台用户
   */
  async createUser(data: CreatePlatformUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>(API_PATHS.users.list, data);
  },

  /**
   * 更新平台用户
   */
  async updateUser(id: string, data: UpdatePlatformUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>(API_PATHS.users.detail(id), data);
  },

  /**
   * 删除平台用户
   */
  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(API_PATHS.users.detail(id));
  },

  /**
   * 重置密码
   */
  async resetPassword(
    id: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(API_PATHS.users.resetPassword(id), {
      newPassword,
    });
  },

  /**
   * 切换用户状态
   */
  async toggleStatus(
    id: string,
    status: "active" | "inactive"
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    return apiClient.post<{ id: string; status: string }>(API_PATHS.users.toggleStatus(id), {
      status,
    });
  },
};

