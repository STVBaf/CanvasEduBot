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

export interface CourseFile {
  id: number;
  display_name: string;
  url: string;
  created_at: string;
  size: number;
}

export interface FileSummary {
  fileId: number;
  summary: string;
  keyPoints: string[];
  actionItems?: string[];
}

export interface StudyGroup {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  memberCount: number;
  maxMembers: number;
  myRole: 'leader' | 'member' | 'none'; 
  members?: string[];
}

export interface CreateGroupParams {
  name: string;
  courseId: number;
}