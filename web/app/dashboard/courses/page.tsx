'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CourseCard } from '@/components/dashboard/CourseCard';
import { api } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Loader2, Search } from 'lucide-react';

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.getCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        console.error('获取课程失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题和搜索 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">全部课程</h1>
          
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索课程名称或代码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
            />
          </div>
        </div>

        {/* 课程网格 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => router.push(`/dashboard/courses/${course.id}`)}
            />
          ))}
        </motion.div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">未找到匹配的课程</p>
          </div>
        )}
      </div>
    </div>
  );
}
