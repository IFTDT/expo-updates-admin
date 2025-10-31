import { apiClient } from "./client";
import { API_PATHS } from "./config";
import type {
  ApiResponse,
  LoginResponse,
  User,
} from "./types";

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   */
  async login(
    email: string,
    password: string,
    rememberMe = false
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>(API_PATHS.auth.login, {
      email,
      password,
      rememberMe,
    });

    // 登录成功后保存 token
    if (response.success && response.data) {
      apiClient.setAccessToken(response.data.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }

    return response;
  },

  /**
   * 用户登出
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<{ message: string }>(
      API_PATHS.auth.logout
    );

    // 登出后清除 token
    if (response.success) {
      apiClient.setAccessToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("refreshToken");
      }
    }

    return response;
  },

  /**
   * 刷新 Token
   */
  async refreshToken(): Promise<ApiResponse<{ accessToken: string; expiresIn: number }>> {
    const refreshToken =
      typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

    if (!refreshToken) {
      return {
        success: false,
        error: {
          code: "NO_REFRESH_TOKEN",
          message: "未找到刷新令牌",
        },
      };
    }

    const response = await apiClient.post<{ accessToken: string; expiresIn: number }>(
      API_PATHS.auth.refresh,
      { refreshToken }
    );

    // 刷新成功后更新 token
    if (response.success && response.data) {
      apiClient.setAccessToken(response.data.accessToken);
    }

    return response;
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_PATHS.auth.me);
  },
};

