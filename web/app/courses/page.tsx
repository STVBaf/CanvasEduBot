'use client';
import { useEffect, useState } from 'react';

// 假数据（后续替换为后端接口返回）
const mockCourses = [
  { id: '1', name: '计算机网络', updateTime: '2024-05-20' },
  { id: '2', name: '人工智能导论', updateTime: '2024-05-18' },
  { id: '3', name: '数据库系统', updateTime: '2024-05-15' },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState(mockCourses);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/courses')
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching courses:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的课程</h1>
        <p className="text-sm text-gray-500">共 {courses.length} 门课程（数据为占位符）</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-500">最后更新：{course.updateTime}</span>
              <button className="text-sm text-indigo-600 hover:underline">查看详情 →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}