import axios, { AxiosInstance, AxiosError } from 'axios';
import type { Course, SyncResponse } from './types';

// 从环境变量获取API地址，如果没有则使用默认值
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('canvas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token 失效,清除本地存储
      localStorage.removeItem('canvas_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// API 方法
export const api = {
  /**
   * 获取课程列表
   */
  getCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/courses');
    return response.data;
  },

  /**
   * 同步课程文件
   * @param courseId 课程ID
   */
  syncCourseFiles: async (courseId: number): Promise<SyncResponse> => {
    const response = await apiClient.post<SyncResponse>(
      `/files/sync?courseId=${courseId}`
    );
    return response.data;
  },
};

export default apiClient;
