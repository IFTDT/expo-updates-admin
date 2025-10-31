import { apiClient } from "./client";
import { API_PATHS } from "./config";
import type {
  ApiResponse,
  UploadResponse,
  UploadProgress,
} from "./types";

/**
 * 上传相关 API
 */
export const uploadApi = {
  /**
   * 上传文件
   */
  async uploadFile(
    file: File,
    appId: string
  ): Promise<ApiResponse<UploadResponse>> {
    return apiClient.upload<UploadResponse>(API_PATHS.upload.upload, file, {
      appId,
    });
  },

  /**
   * 获取上传进度
   */
  async getUploadProgress(uploadId: string): Promise<ApiResponse<UploadProgress>> {
    return apiClient.get<UploadProgress>(API_PATHS.upload.progress(uploadId));
  },
};

