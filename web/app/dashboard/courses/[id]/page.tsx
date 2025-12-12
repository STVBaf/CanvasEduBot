'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Calendar, FileText, ArrowLeft, Sparkles, X, Loader2, Download } from 'lucide-react';
import Link from 'next/link';

interface FileSummary {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id;

  // 状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<FileSummary | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  // 模拟文件列表数据
  const demoFiles = [
    { id: 101, name: 'Lecture_01_Introduction.pdf', date: '2025-09-01', size: '2.4 MB' },
    { id: 102, name: 'Chapter_2_Readings.docx', date: '2025-09-15', size: '1.1 MB' },
    { id: 103, name: 'Assignment_Guidelines.pdf', date: '2025-10-01', size: '500 KB' },
  ];

  // 模拟获取 AI 总结的函数
  const handleViewSummary = (fileName: string) => {
    setSelectedFileName(fileName);
    setIsModalOpen(true);
    setIsLoading(true);

    // 后端API调用
    // const data = await api.getFileSummary(fileId);
    
    // 模拟网络请求延迟
    setTimeout(() => {
      setCurrentSummary({
        summary: "这份文档主要介绍了课程的核心概念，重点阐述了React Hooks的高级用法以及性能优化的最佳实践。文档通过实际案例分析了闭包陷阱产生的原因及解决方案。",
        keyPoints: [
          "useMemo 用于缓存计算结果，避免昂贵的计算重复执行。",
          "useCallback 用于缓存函数引用，防止子组件不必要的重渲染。",
          "React.memo 配合 useCallback 才能达到最佳优化效果。",
          "注意依赖项数组（Dependency Array）的正确填写。"
        ],
        actionItems: [
          "复习第3章关于闭包的原理",
          "完成课后练习题 3.1 - 3.5"
        ]
      });
      setIsLoading(false);
    }, 1000);
  };

  const assignments = [
    { id: 1, title: '期中论文草稿', due: '2025-10-15 23:59', status: 'pending' },
    { id: 2, title: '第3章课后习题', due: '2025-10-20 12:00', status: 'submitted' },
    { id: 3, title: '小组项目提案', due: '2025-11-01 18:00', status: 'pending' },
  ];

  return (
    <div className="space-y-8 relative"> 
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
        <div className="lg:col-span-2 space-y-8">
          
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

           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> 课程资料
              </CardTitle>
            </CardHeader>
            <CardContent>
              {demoFiles.length > 0 ? (
                <div className="space-y-3">
                  {demoFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 truncate pr-4">{file.name}</h4>
                          <p className="text-xs text-muted-foreground">{file.date} · {file.size}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewSummary(file.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          AI 总结
                        </button>
                        
                        <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  暂无文件同步记录
                </div>
              )}
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

      {/* AI 总结弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">文件智能总结</h3>
                  <p className="text-xs text-muted-foreground max-w-[300px] truncate">{selectedFileName}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-sm text-muted-foreground animate-pulse">AI 正在阅读文档并生成摘要...</p>
                </div>
              ) : currentSummary ? (
                <div className="space-y-6">
                  {/* 核心摘要 */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      核心内容
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                      {currentSummary.summary}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      知识要点
                    </h4>
                    <ul className="grid gap-2">
                      {currentSummary.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      建议行动
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentSummary.actionItems.map((item, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-red-400">
                  生成总结失败，请稍后重试。
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}