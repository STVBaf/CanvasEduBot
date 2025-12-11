'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CourseCard } from '@/components/dashboard/CourseCard';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import { StudyGroupsWidget } from '@/components/dashboard/StudyGroupsWidget';
import { KnowledgeBaseWidget } from '@/components/dashboard/KnowledgeBaseWidget';
import { api } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('canvas_token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const data = await api.getCourses();
        setCourses(data);
      } catch (err: any) {
        setError(err.response?.data?.message || '获取课程失败');
        if (err.response?.status === 401) {
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl font-medium"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* 第一行: 课程卡片 + 日历 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 课程列表 - 占2列 */}
          <motion.div variants={item} className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">我的课程</h2>
              <p className="text-gray-500">共 {courses.length} 门课程</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.slice(0, 4).map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                />
              ))}
            </div>

            {courses.length > 4 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/dashboard/courses')}
                className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-yellow-400 hover:text-yellow-600 transition-colors font-medium"
              >
                查看全部课程 ({courses.length})
              </motion.button>
            )}
          </motion.div>

          {/* 日历 - 占1列 */}
          <motion.div variants={item}>
            <CalendarWidget />
          </motion.div>
        </div>

        {/* 第二行: 学习小组 */}
        <motion.div variants={item}>
          <StudyGroupsWidget />
        </motion.div>

        {/* 第三行: 知识库统计 */}
        <motion.div variants={item}>
          <KnowledgeBaseWidget />
        </motion.div>
      </motion.div>
    </div>
  );
}
