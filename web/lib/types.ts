// API 响应类型定义

export interface Course {
  id: number;
  name: string;
  course_code: string;
  start_at: string | null;
}

export interface SyncResponse {
  status: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
