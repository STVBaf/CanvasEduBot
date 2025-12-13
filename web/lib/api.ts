import axios, { AxiosInstance, AxiosError } from 'axios';
import type { Course, SyncResponse, FileSummary, StudyGroup, CreateGroupParams, CourseFile, Assignment } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('canvas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('canvas_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  getMe: async () => { const response = await apiClient.get('/user/me'); return response.data; },
  getCourses: async (): Promise<Course[]> => { const response = await apiClient.get<Course[]>('/courses'); return response.data; },
  syncCourseFiles: async (courseId: string | number): Promise<SyncResponse> => { const response = await apiClient.post<SyncResponse>(`/files/sync?courseId=${courseId}`); return response.data; },
  getFileSummary: async (fileId: string): Promise<FileSummary> => { console.warn("API for getFileSummary is mocked!"); return new Promise((resolve) => { setTimeout(() => { resolve({ fileId, summary: "这份文档主要介绍了课程的核心概念...", keyPoints: ["要点1", "要点2"], actionItems: ["复习", "练习"] }); }, 1500); }); },
  getCourseFiles: async (courseId: string | number): Promise<CourseFile[]> => { const response = await apiClient.get<{ files: CourseFile[] }>(`/files/course/${courseId}`); return response.data.files; },
  getCourseAssignments: async (courseId: string | number): Promise<Assignment[]> => { const response = await apiClient.get<Assignment[]>(`/assignments/course/${courseId}`); return response.data; },
  getUpcomingAssignments: async (days: number = 30): Promise<Assignment[]> => { const response = await apiClient.get<Assignment[]>('/assignments/upcoming', { params: { days } }); return response.data; },
  getUrgentAssignments: async (): Promise<Assignment[]> => { const response = await apiClient.get<Assignment[]>('/assignments/urgent'); return response.data; },
  getGroups: async (): Promise<StudyGroup[]> => { const response = await apiClient.get<{ groups: StudyGroup[] }>('/groups/my'); return response.data.groups; },
  createGroup: async (params: CreateGroupParams): Promise<StudyGroup> => { const response = await apiClient.post<{ group: StudyGroup }>('/groups', params); return response.data.group; },
  leaveGroup: async (groupId: string): Promise<void> => { await apiClient.post(`/groups/${groupId}/leave`); },
  disbandGroup: async (groupId: string): Promise<void> => { await apiClient.delete(`/groups/${groupId}`); },
  joinGroup: async (groupId: string): Promise<void> => { await apiClient.post(`/groups/${groupId}/join`); }
};