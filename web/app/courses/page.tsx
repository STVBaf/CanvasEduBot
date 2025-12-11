'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Course } from '@/lib/types';
import Link from 'next/link'; 

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      // 检查是否有token
      const token = localStorage.getItem('canvas_token');
      if (!token) {
        setError('未检测到Token，请先保存Token');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await api.getCourses();
        setCourses(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || '未知错误';
        if (err.response?.status === 401) {
          setError('Token已失效，请重新登录');
          setTimeout(() => router.push('/'), 2000);
        } else {
          setError(`获取课程失败：${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  const syncCourseFiles = async (courseId: number) => {
    if (!confirm(`确定要同步课程ID: ${courseId}的文件吗？`)) return;

    try {
      const data = await api.syncCourseFiles(courseId);
      if (data.status === 'accepted') {
        alert('文件同步任务已触发，将在后台执行');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '请重试';
      alert(`同步失败：${errorMessage}`);
    }
  };

  if (loading) return <div className="container mx-auto p-4">加载中...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">我的课程</h1>
      <p className="text-sm text-gray-500 mb-6">共 {courses.length} 门课程</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div 
            key={course.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
            <p className="text-xs text-gray-500 mt-2">课程代码：{course.course_code}</p>
            <p className="text-xs text-gray-500 mt-1">
              开始时间：{course.start_at ? new Date(course.start_at).toLocaleString() : '未设置'}
            </p>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => syncCourseFiles(course.id)}
                className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200"
              >
                同步文件
              </button>
              <Link 
                href={`/courses/${course.id}`}
                className="text-sm text-indigo-600 hover:underline"
              >
                查看详情
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}