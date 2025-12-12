<<<<<<< HEAD
// canvasClient.ts
import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const CANVAS_TOKEN = process.env.CANVAS_ACCESS_TOKEN;
const BASE_URL = process.env.CANVAS_BASE_URL;

if (!CANVAS_TOKEN || !BASE_URL) {
  console.error('❌ 请在 .env 文件中配置 CANVAS_ACCESS_TOKEN 和 CANVAS_BASE_URL');
  process.exit(1);
}

// 创建一个配置好的 axios 实例
const canvasApi = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    Authorization: `Bearer ${CANVAS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// 定义接口类型 (简单定义一下，方便开发)
interface CanvasCourse {
  id: number;
  name: string;
  course_code: string; // 比如 "CS101"
}

interface CanvasFile {
  id: number;
  display_name: string; // 文件名
  url: string;          // 下载链接
  size: number;
  content_type: string; // 文件类型 application/pdf 等
  created_at: string;
}

// 1. 获取当前正在进行的课程
export async function getActiveCourses() {
  try {
    const response = await canvasApi.get<CanvasCourse[]>('/courses', {
      params: {
        enrollment_state: 'active', // 只看正在上的课
        per_page: 100, // 一次拿100个，防止分页麻烦
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取课程失败:', error);
    return [];
  }
}

// 2. 获取某门课的文件
export async function getCourseFiles(courseId: number) {
  try {
    const response = await canvasApi.get<CanvasFile[]>(`/courses/${courseId}/files`, {
      params: {
        sort: 'created_at',
        order: 'desc', // 最新的文件排前面
        per_page: 50,
        // 只获取这几种类型，过滤掉图片和网页
        'content_types[]': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint'],
      },
    });
    return response.data;
  } catch (error) {
    console.error(`获取课程 ${courseId} 的文件失败:`, error);
    return [];
  }
=======
// canvasClient.ts
import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const CANVAS_TOKEN = process.env.CANVAS_ACCESS_TOKEN;
const BASE_URL = process.env.CANVAS_BASE_URL;

if (!CANVAS_TOKEN || !BASE_URL) {
  console.error('❌ 请在 .env 文件中配置 CANVAS_ACCESS_TOKEN 和 CANVAS_BASE_URL');
  process.exit(1);
}

// 创建一个配置好的 axios 实例
const canvasApi = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    Authorization: `Bearer ${CANVAS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// 定义接口类型 (简单定义一下，方便开发)
interface CanvasCourse {
  id: number;
  name: string;
  course_code: string; // 比如 "CS101"
}

interface CanvasFile {
  id: number;
  display_name: string; // 文件名
  url: string;          // 下载链接
  size: number;
  content_type: string; // 文件类型 application/pdf 等
  created_at: string;
}

// 1. 获取当前正在进行的课程
export async function getActiveCourses() {
  try {
    const response = await canvasApi.get<CanvasCourse[]>('/courses', {
      params: {
        enrollment_state: 'active', // 只看正在上的课
        per_page: 100, // 一次拿100个，防止分页麻烦
      },
    });
    return response.data;
  } catch (error) {
    console.error('获取课程失败:', error);
    return [];
  }
}

// 2. 获取某门课的文件
export async function getCourseFiles(courseId: number) {
  try {
    const response = await canvasApi.get<CanvasFile[]>(`/courses/${courseId}/files`, {
      params: {
        sort: 'created_at',
        order: 'desc', // 最新的文件排前面
        per_page: 50,
        // 只获取这几种类型，过滤掉图片和网页
        'content_types[]': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint'],
      },
    });
    return response.data;
  } catch (error) {
    console.error(`获取课程 ${courseId} 的文件失败:`, error);
    return [];
  }
>>>>>>> 912218083e6d5db2086272c75935fd422a011ff4
}