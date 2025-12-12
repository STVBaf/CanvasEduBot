import axios, { AxiosInstance, AxiosError } from 'axios';
import type { Course, SyncResponse, FileSummary, StudyGroup, CreateGroupParams } from './types';

// 从环境变量获取API地址，如果没有则使用默认值
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

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

let mockGroups: StudyGroup[] = [
  { 
    id: 1, 
    name: 'CS101 学习小组', 
    courseId: 101, 
    courseName: 'Python 程序设计', 
    memberCount: 4, 
    maxMembers: 6, 
    myRole: 'member',
    members: ['Alice', 'Bob', '我', 'David']
  },
  { 
    id: 2, 
    name: '考研数学交流', 
    courseId: 202, 
    courseName: '线性代数', 
    memberCount: 12, 
    maxMembers: 20, 
    myRole: 'leader',
    members: ['我', 'Tom', 'Jerry', '...']
  },
  { 
    id: 3, 
    name: '英语口语练习', 
    courseId: 105, 
    courseName: '大学英语', 
    memberCount: 3, 
    maxMembers: 4, 
    myRole: 'none',
    members: ['Mike', 'Sarah', 'John']
  }
];

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

  getFileSummary: async (fileId: number): Promise<FileSummary> => {
    // 后端接口就绪后，取消下方注释并删除模拟数据
    /*
    const response = await apiClient.get<FileSummary>(`/files/${fileId}/summary`);
    return response.data;
    */

    // 模拟数据
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          fileId,
          summary: "这份文档详细介绍了React Hooks的高级用法，重点阐述了useMemo和useCallback在性能优化中的应用场景。文档通过实际案例分析了闭包陷阱产生的原因及解决方案。",
          keyPoints: [
            "useMemo 用于缓存计算结果，避免昂贵的计算重复执行。",
            "useCallback 用于缓存函数引用，防止子组件不必要的重渲染。",
            "React.memo 配合 useCallback 才能达到最佳优化效果。",
            "注意依赖项数组（Dependency Array）的正确填写。"
          ],
          actionItems: [
            "复习第3章关于闭包的原理",
            "完成课后练习题 3.1 - 3.5"
          ]
        });
      }, 1000); // 模拟 1秒 网络延迟
    });
  },

  getGroups: async (): Promise<StudyGroup[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockGroups]), 500);
    });
  },

  /** 创建小组 */
  createGroup: async (params: CreateGroupParams): Promise<StudyGroup> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 1. 检查是否已经在该课程的其他小组中
        const alreadyInGroup = mockGroups.find(
          g => g.courseId === params.courseId && g.myRole !== 'none'
        );

        if (alreadyInGroup) {
          reject(new Error("您已加入该课程的其他小组，无法创建新组"));
          return;
        }

        const newGroup: StudyGroup = {
          id: Date.now(),
          name: params.name,
          courseId: params.courseId,
          courseName: `Course ${params.courseId}`, 
          memberCount: 1,
          maxMembers: 10,
          myRole: 'leader',
          members: ['我']
        };
        mockGroups.unshift(newGroup);
        resolve(newGroup);
      }, 800);
    });
  },

  /** 退出小组 */
  leaveGroup: async (groupId: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockGroups = mockGroups.map(g => {
          if (g.id === groupId) {
            return { 
              ...g, 
              myRole: 'none', 
              memberCount: Math.max(0, g.memberCount - 1),
              members: g.members?.filter(name => name !== '我') 
            };
          }
          return g;
        });
        resolve();
      }, 600);
    });
  },

  /** 解散小组 */
  disbandGroup: async (groupId: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockGroups = mockGroups.filter(g => g.id !== groupId);
        resolve();
      }, 600);
    });
  },
  
  /** 加入小组 */
  joinGroup: async (groupId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 1. 找到要加入的目标小组
        const targetGroup = mockGroups.find(g => g.id === groupId);
        if (!targetGroup) {
          reject(new Error("小组不存在"));
          return;
        }

        // 2. 检查是否已经在该课程的其他小组中
        const alreadyInGroup = mockGroups.find(
          g => g.courseId === targetGroup.courseId && g.myRole !== 'none'
        );

        if (alreadyInGroup) {
          reject(new Error("您已加入该课程的其他小组，无法加入此组"));
          return;
        }

        // 3. 执行加入逻辑
        mockGroups = mockGroups.map(g => {
          if (g.id === groupId) {
            return { 
              ...g, 
              myRole: 'member', 
              memberCount: g.memberCount + 1,
              members: [...(g.members || []), '我']
            };
          }
          return g;
        });
        resolve();
      }, 600);
    });
  }
};

export default apiClient;
