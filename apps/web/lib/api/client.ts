import { API_CONFIG } from "./config";
import type { ApiResponse, ApiErrorResponse } from "./types";

/**
 * API 客户端类
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private accessToken: string | null = null;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;

    // 从 localStorage 恢复 token
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
    }
  }

  /**
   * 设置访问令牌
   */
  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }
    }
  }

  /**
   * 获取访问令牌
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * 创建请求
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // 添加认证头
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 处理非 JSON 响应（如文件下载）
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/octet-stream")) {
        return {
          success: true,
          data: response as unknown as T,
        } as ApiResponse<T>;
      }

      const data = await response.json();

      // 处理 HTTP 错误状态
      if (!response.ok) {
        const error: ApiErrorResponse = {
          success: false,
          error: {
            code: data.error?.code || `HTTP_${response.status}`,
            message: data.error?.message || data.message || "请求失败",
            details: data.error?.details || data,
          },
        };
        return error as unknown as ApiResponse<T>;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: {
              code: "TIMEOUT",
              message: "请求超时",
            },
          } as unknown as ApiResponse<T>;
        }
      }

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "网络错误",
        },
      } as unknown as ApiResponse<T>;
    }
  }

  /**
   * GET 请求
   */
  async get<T>(
    url: string,
    params?: Record<string, unknown> | URLSearchParams
  ): Promise<ApiResponse<T>> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params instanceof URLSearchParams) {
        // 如果已经是 URLSearchParams，直接使用
        const queryString = params.toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request<T>(fullUrl, {
          method: "GET",
        });
      }
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return this.request<T>(fullUrl, {
      method: "GET",
    });
  }

  /**
   * POST 请求
   */
  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 请求
   */
  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH 请求
   */
  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * 下载文件
   */
  async download(url: string): Promise<Blob> {
    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`下载失败: ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 上传文件
   */
  async upload<T>(
    url: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: "POST",
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const error: ApiErrorResponse = {
          success: false,
          error: {
            code: data.error?.code || `HTTP_${response.status}`,
            message: data.error?.message || data.message || "上传失败",
            details: data.error?.details || data,
          },
        };
        return error as unknown as ApiResponse<T>;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "网络错误",
        },
      } as unknown as ApiResponse<T>;
    }
  }
}

// 创建全局 API 客户端实例
export const apiClient = new ApiClient(API_CONFIG.baseURL, API_CONFIG.timeout);

