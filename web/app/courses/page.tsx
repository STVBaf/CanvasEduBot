'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // 封装fetch请求工具，修改为实际后端接口地址（例如后端实际地址是https://canvas.sufe.edu.cn/api）
  const request = async (url, method = 'GET', data = null) => {
    const token = localStorage.getItem('canvas_token');
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    // 替换为后端实际的基础地址（根据后端提供的接口地址修改）
    const response = await fetch(`https://canvas.sufe.edu.cn/api${url}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await request('/v1/courses'); // 若后端接口路径有版本号（如/v1），需补充
        setCourses(data);
      } catch (err) {
        if (err.message.includes('401')) {
          localStorage.removeItem('canvas_token');
          setError('Token已失效，请重新登录');
          setTimeout(() => router.push('/'), 2000);
        } else {
          setError(`获取课程失败：${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  const syncCourseFiles = async (courseId) => {
    if (!confirm(`确定要同步课程ID: ${courseId}的文件吗？`)) return;

    try {
      const data = await request(`/v1/files/sync?courseId=${courseId}`, 'POST'); // 补充接口版本号（如有）
      if (data.status === 'accepted') {
        alert('文件同步任务已触发，将在后台执行');
      }
    } catch (err) {
      alert(`同步失败：${err.message || '请重试'}`);
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
              <button className="text-sm text-indigo-600 hover:underline">查看详情</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}