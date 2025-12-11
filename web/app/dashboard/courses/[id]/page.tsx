'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Calendar, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id;

  // Placeholder data - to be replaced by API
  const assignments = [
    { id: 1, title: '期中论文草稿', due: '2025-10-15 23:59', status: 'pending' },
    { id: 2, title: '第3章课后习题', due: '2025-10-20 12:00', status: 'submitted' },
    { id: 3, title: '小组项目提案', due: '2025-11-01 18:00', status: 'pending' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">课程详情</h1>
          <p className="text-muted-foreground">Course ID: {courseId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Agent Summary & Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Agent Summary Section */}
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

          {/* Course Content Placeholder */}
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> 课程资料
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                暂无文件同步记录
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assignments */}
        <div className="space-y-8">
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
        </div>
      </div>
    </div>
  );
}
