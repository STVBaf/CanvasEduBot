'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Calendar, FileText, ArrowLeft, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { FileMeta } from '@/lib/types';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      if (!courseId) return;
      try {
        setLoadingFiles(true);
        // 1. Trigger Sync
        await api.syncCourseFiles(Number(courseId));
        // 2. Fetch updated list
        const data = await api.getCourseFiles(Number(courseId));
        setFiles(data);
      } catch (error) {
        console.error('Failed to sync/load files:', error);
      } finally {
        setLoadingFiles(false);
      }
    };

    loadFiles();
  }, [courseId]);

  // Placeholder data - to be replaced by API
  const assignments = [
    { id: 1, title: '期中论文草稿', due: '2025-10-15 23:59', status: 'pending' },
    { id: 2, title: '第3章课后习题', due: '2025-10-20 12:00', status: 'submitted' },
    { id: 3, title: '小组项目提案', due: '2025-11-01 18:00', status: 'pending' },
  ];

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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">课程详情</h1>
          <p className="text-muted-foreground">Course ID: {courseId}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Agent Summary & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Agent Summary Section */}
          <motion.div variants={item}>
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-none overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Bot className="w-6 h-6" />
                  智能助教总结
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 min-h-[200px] flex items-center justify-center border border-indigo-100/50">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Bot className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-medium text-indigo-900">AI 正在分析课程内容...</h3>
                    <p className="text-sm text-indigo-600/80 max-w-xs mx-auto">
                      此区域将展示课程进度的智能摘要、重点知识提醒以及个性化学习建议。
                      <br/>
                      (功能开发中)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Content */}
          <motion.div variants={item}>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" /> 课程资料
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFiles ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>正在同步 Canvas 文件...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    暂无文件
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate text-gray-900">{file.fileName}</p>
                            <p className="text-xs text-muted-foreground">{new Date(file.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a 
                          href={file.downloadUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                          title="下载文件"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Assignments */}
        <motion.div variants={item} className="space-y-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> 作业列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-2 h-2 mt-2 rounded-full ${assignment.status === 'pending' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900">{assignment.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">截止: {assignment.due}</p>
                    </div>
                    {assignment.status === 'pending' && (
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        进行中
                      </span>
                    )}
                  </div>
                ))}
                <div className="pt-4 text-center">
                  <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    查看所有作业
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
