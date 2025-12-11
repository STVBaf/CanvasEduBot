'use client';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, FileText, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/card';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  // 生成随机渐变色
  const gradients = [
    'from-blue-400 to-cyan-400',
    'from-purple-400 to-pink-400',
    'from-orange-400 to-red-400',
    'from-green-400 to-emerald-400',
    'from-yellow-400 to-orange-400',
  ];
  
  const gradient = gradients[course.id % gradients.length];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* 顶部渐变条 */}
        <div className={`h-2 bg-gradient-to-r ${gradient}`} />
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                {course.name}
              </h3>
              <p className="text-sm text-gray-500">
                课程代码: {course.course_code}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 ml-3`}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-xs text-gray-500">作业</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-gray-500">待提交</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">28</div>
              <div className="text-xs text-gray-500">文件</div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                {course.start_at ? new Date(course.start_at).toLocaleDateString('zh-CN') : '未设置'}
              </span>
            </div>
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-1 text-sm font-medium text-yellow-600"
            >
              查看详情
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
