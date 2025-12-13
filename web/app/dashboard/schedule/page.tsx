'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Filter, X, ArrowUpRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Assignment, Course } from '@/lib/types';

export default function SchedulePage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [urgentDeadlines, setUrgentDeadlines] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [upcomingData, urgentData, coursesData] = await Promise.all([
          api.getUpcomingAssignments(30),
          api.getUrgentAssignments(),
          api.getCourses()
        ]);
        setAssignments(Array.isArray(upcomingData) ? upcomingData : []);
        setUrgentDeadlines(Array.isArray(urgentData) ? urgentData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (error) {
        console.error('Failed to fetch schedule data:', error);
        setAssignments([]);
        setUrgentDeadlines([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCourseCode = (courseId?: string | number) => {
    if (!courseId) return 'N/A';
    const course = courses.find(c => String(c.id) === String(courseId));
    return course ? course.course_code : 'Unknown';
  };

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return '无截止日期';
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return `明天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return '无截止日期';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredAssignments = Array.isArray(assignments) 
    ? assignments.filter(assign => !showPendingOnly || !assign.hasSubmittedSubmissions) 
    : [];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">日程安排</h1>
        <p className="text-muted-foreground mt-1">查看所有即将到来的截止日期和考试</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={item}>
            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[2rem]">
              <CardHeader className="border-b border-gray-100 pb-4 px-8 pt-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> 作业截止列表</CardTitle>
                  <button onClick={() => setShowPendingOnly(!showPendingOnly)} className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all ${showPendingOnly ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{showPendingOnly ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}{showPendingOnly ? '显示全部' : '只看未完成'}</button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 text-xs uppercase text-gray-400 font-medium"><tr><th className="px-8 py-4 text-left tracking-wider">状态</th><th className="px-6 py-4 text-left tracking-wider">作业名称</th><th className="px-6 py-4 text-left tracking-wider">课程</th><th className="px-6 py-4 text-left tracking-wider">截止时间</th><th className="px-8 py-4 text-right tracking-wider">前往课程</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        <tr><td colSpan={5} className="py-12 text-center"><div className="flex justify-center items-center gap-2 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> 加载中...</div></td></tr>
                      ) : filteredAssignments.length > 0 ? (
                        filteredAssignments.map((assign) => (
                          <tr key={assign.id} className="group hover:bg-gray-50/80 transition-colors">
                            <td className="px-8 py-5 whitespace-nowrap">{assign.hasSubmittedSubmissions ? <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit"><CheckCircle2 className="w-4 h-4" /><span className="text-xs font-bold">已提交</span></div> : <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full w-fit"><Circle className="w-4 h-4" /><span className="text-xs font-bold">进行中</span></div>}</td>
                            <td className="px-6 py-5"><span className="font-bold text-gray-900 group-hover:text-primary transition-colors text-base line-clamp-1" title={assign.name}>{assign.name}</span></td>
                            <td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">{getCourseCode(assign.courseId).substring(0, 2)}</div><div className="flex flex-col"><span className="text-sm font-bold text-gray-900">{getCourseCode(assign.courseId)}</span><span className="text-xs text-muted-foreground line-clamp-1" title={assign.courseName}>{assign.courseName}</span></div></div></td>
                            <td className="px-6 py-5 whitespace-nowrap"><div className="flex items-center gap-2 text-sm font-medium text-gray-700"><CalendarIcon className="w-4 h-4 text-gray-400" />{formatDisplayDate(assign.dueAt)}</div></td>
                            <td className="px-8 py-5 text-right"><Link href={`/dashboard/courses/${assign.courseId}`} title="前往课程详情页" className="inline-flex p-2 rounded-full hover:bg-white hover:shadow-md text-gray-400 hover:text-primary transition-all cursor-pointer"><ArrowUpRight className="w-5 h-5" /></Link></td>
                          </tr>
                        ))
                      ) : <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">没有符合条件的作业 🎉</td></tr>}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div variants={item}>
            <Card className="bg-white sticky top-8 rounded-[2rem] border-none shadow-sm">
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" /> 日历视图
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
                  {['一', '二', '三', '四', '五', '六', '日'].map(d => <div key={d} className="text-muted-foreground text-xs py-1">{d}</div>)}
                  {Array.from({ length: 30 }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === new Date().getDate();
                    return <div key={i} className={`aspect-square flex items-center justify-center rounded-full text-sm cursor-pointer hover:bg-gray-100 ${isToday ? 'bg-black text-white hover:bg-black' : ''}`}>{day}</div>;
                  })}
                </div>
                <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">即将截止 (3天内)</h3>
                  {loading ? <Loader2 className="animate-spin" /> : urgentDeadlines.length > 0 ? (
                    urgentDeadlines.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-orange-50 transition-colors group cursor-pointer">
                        <div className="w-2 h-2 mt-2 rounded-full bg-red-500"></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-muted-foreground group-hover:text-orange-700">{item.courseName} • {formatDueDate(item.dueAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : <div className="text-center py-4 text-xs text-muted-foreground">暂无紧急作业 🍵</div>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}