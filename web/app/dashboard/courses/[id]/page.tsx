'use client';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, FileText, Users, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* 返回按钮 */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </motion.button>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            课程详情
          </h1>
          <p className="text-gray-500">课程 ID: {courseId}</p>
        </div>

        {/* 功能开发中提示 */}
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-10 h-10 text-yellow-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                功能开发中
              </h2>
              <p className="text-gray-600">
                课程详情页面正在开发中,敬请期待!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <Calendar className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">作业安排</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">课程文件</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <Users className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">课程成员</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <Settings className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">课程设置</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 pt-4">
              需要后端提供课程详情、作业列表、文件列表等接口
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
