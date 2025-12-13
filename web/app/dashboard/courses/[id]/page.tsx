'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Calendar, FileText, ArrowLeft, Sparkles, X, Loader2, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { FileSummary, CourseFile, Assignment } from '@/lib/types';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  // 状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<FileSummary | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  // 数据状态
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 获取真实数据
  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [filesResponse, assignmentsResponse] = await Promise.all([
          api.getCourseFiles(courseId),
          api.getCourseAssignments(courseId)
        ]);
        setFiles(filesResponse);
        setAssignments(assignmentsResponse);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [courseId]);

  // 获取 AI 总结
  const handleViewSummary = async (file: CourseFile) => {
    setSelectedFileName(file.fileName);
    setIsModalOpen(true);
    setIsLoadingSummary(true);
    setCurrentSummary(null);

    try {
      const data = await api.getFileSummary(file.id);
      setCurrentSummary(data);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' });
  };
  
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return '无截止日期';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatSize = (bytes: number | null) => {
    if (bytes === null || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 relative"> 
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
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

          {/* Course Files List */}
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> 课程资料
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
              ) : files.length > 0 ? (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 truncate pr-4" title={file.fileName}>{file.fileName}</h4>
                          <p className="text-xs text-muted-foreground">{formatDate(file.createdAt)} · {formatSize(file.fileSize)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewSummary(file)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors whitespace-nowrap"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          AI 总结
                        </button>
                        
                        <a 
                          href={file.downloadUrl} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                          title="下载文件"
                        >
                          <Download className="w-4 h-4" />
                        </a>
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
              {isLoadingData ? (
                 <div className="space-y-4">
                   {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
                 </div>
              ) : assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                      <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!assignment.hasSubmittedSubmissions ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate" title={assignment.name}>{assignment.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">截止: {formatDueDate(assignment.dueAt)}</p>
                      </div>
                      {!assignment.hasSubmittedSubmissions && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full whitespace-nowrap">
                          进行中
                        </span>
                      )}
                      {assignment.htmlUrl && (
                        <a href={assignment.htmlUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  暂无作业
                </div>
              )}
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
          </div>
        </div>
      )}
    </div>
  );
}