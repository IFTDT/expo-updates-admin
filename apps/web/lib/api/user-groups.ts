import { apiClient } from "./client";
import { API_PATHS } from "./config";
import type {
  ApiResponse,
  UserGroup,
  CreateUserGroupRequest,
  UpdateUserGroupRequest,
  ListQueryParams,
} from "./types";

/**
 * 用户分组相关 API
 */
export const userGroupsApi = {
  /**
   * 获取用户分组列表
   */
  async getUserGroups(
    appId: string,
    params?: ListQueryParams & { search?: string }
  ): Promise<ApiResponse<{ items: UserGroup[] }>> {
    return apiClient.get<{ items: UserGroup[] }>(API_PATHS.apps.userGroups(appId), params as Record<string, unknown>);
  },

  /**
   * 获取用户分组详情
   */
  async getUserGroup(appId: string, id: string): Promise<ApiResponse<UserGroup>> {
    return apiClient.get<UserGroup>(API_PATHS.apps.userGroupDetail(appId, id));
  },

  /**
   * 创建用户分组
   */
  async createUserGroup(
    appId: string,
    data: CreateUserGroupRequest
  ): Promise<ApiResponse<UserGroup>> {
    return apiClient.post<UserGroup>(API_PATHS.apps.userGroups(appId), data);
  },

  /**
   * 更新用户分组
   */
  async updateUserGroup(
    appId: string,
    id: string,
    data: UpdateUserGroupRequest
  ): Promise<ApiResponse<UserGroup>> {
    return apiClient.put<UserGroup>(API_PATHS.apps.userGroupDetail(appId, id), data);
  },

  /**
   * 删除用户分组
   */
  async deleteUserGroup(appId: string, id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(API_PATHS.apps.userGroupDetail(appId, id));
  },

  /**
   * 添加用户到分组
   */
  async addUsersToGroup(
    appId: string,
    id: string,
    userIds: string[]
  ): Promise<ApiResponse<{ addedCount: number; userCount: number }>> {
    return apiClient.post<{ addedCount: number; userCount: number }>(
      API_PATHS.apps.userGroupUsers(appId, id),
      { userIds }
    );
  },

  /**
   * 从分组移除用户
   */
  async removeUsersFromGroup(
    appId: string,
    id: string,
    userIds: string[]
  ): Promise<ApiResponse<{ removedCount: number; userCount: number }>> {
    return apiClient.delete<{ removedCount: number; userCount: number }>(
      API_PATHS.apps.userGroupUsers(appId, id),
      { userIds }
    );
  },
};

