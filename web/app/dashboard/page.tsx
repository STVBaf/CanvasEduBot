'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, BrainCircuit, ArrowRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import type { Course, StudyGroup, Assignment } from '@/lib/types';

// Helper to assign colors to courses
const getCourseColor = (index: number) => {
  const colors = ['bg-orange-100 text-orange-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700'];
  return colors[index % colors.length];
};

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [urgentDeadlines, setUrgentDeadlines] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, groupsData, urgentData] = await Promise.all([
          api.getCourses(),
          api.getGroups(),
          api.getUrgentAssignments()
        ]);
        setCourses(coursesData);
        setMyGroups(groupsData);
        setUrgentDeadlines(urgentData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const formatTerm = (startAt: string | null): string => {
    if (!startAt) return '未知学期';
    try {
      const date = new Date(startAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const semester = month >= 9 ? '第1学期' : '第2学期';
      return `${year}-${year + 1}学年${semester}`;
    } catch (e) {
      return '未知学期';
    }
  };

  const getRoleBadge = (group: StudyGroup) => {
    if (group.isCreator) return <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">组长</span>;
    if (group.isMember) return <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">成员</span>;
    return null;
  };
  
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return '无截止日期';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">你好, 同学! 👋</h1>
          <p className="text-muted-foreground mt-1">准备好开始今天的学习了吗？</p>
        </div>
        <div className="flex gap-4">
          <div className="relative"><input type="text" placeholder="搜索课程或资料..." className="pl-10 pr-4 py-3 rounded-full bg-white border-none shadow-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20" /><svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity">同步数据</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={item}>
            <Card className="bg-[#e8e6df] border-none overflow-hidden relative">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between relative z-10">
                <div className="space-y-4 max-w-md">
                  <div className="inline-block px-3 py-1 rounded-full bg-black/5 text-xs font-bold uppercase tracking-wider">今日概览</div>
                  <h2 className="text-3xl font-bold leading-tight">{loading ? '正在加载...' : (<>你今天有 <span className="text-orange-600">{Array.isArray(urgentDeadlines) ? urgentDeadlines.length : 0} 个待办事项</span> 需要完成</>)}</h2>
                  <div className="flex gap-6 pt-2">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400"></div><span className="text-sm font-medium">待处理</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-sm font-medium">已完成</span></div>
                  </div>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Courses Grid */}
          <motion.div variants={item}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">我的课程</h2>
          <Link href="/dashboard/courses" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1">
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-48 animate-pulse bg-gray-100 rounded-[2rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.slice(0, 4).map((course, index) => (
              <Link href={`/dashboard/courses/${course.id}`} key={course.id}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-none rounded-[2rem] relative overflow-hidden h-full">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${getCourseColor(index)}`}>
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                        {course.course_code || 'NO CODE'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-8">
                      <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                        {course.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CalendarIcon className="w-4 h-4" />
                        <span>2025-2026学年第1学期</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-2">
                        {['S1', 'S2', 'S3'].map((tag) => (
                          <span key={tag} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={item}>
              <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">学习小组</h2><Link href="/dashboard/groups" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1">查看全部 <ArrowRight className="w-4 h-4" /></Link></div>
              <div className="space-y-3">{loading ? <Loader2 className="animate-spin" /> : myGroups.length > 0 ? (myGroups.slice(0, 3).map((group) => (<Link href="/dashboard/groups" key={group.id}><Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer border-none shadow-sm"><CardContent className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600"><Users className="w-5 h-5" /></div><div><h4 className="font-bold text-sm text-gray-900">{group.name}</h4><p className="text-xs text-muted-foreground">{group.memberCount} 位成员</p></div></div>{getRoleBadge(group)}</CardContent></Card></Link>))) : <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-2xl">暂未加入任何小组</div>}</div>
            </motion.div>
            <motion.div variants={item}>
              <h2 className="text-xl font-bold mb-6">个人知识库</h2>
              <Card className="bg-black text-white h-full"><CardContent className="p-6 flex flex-col justify-between h-full"><div className="flex justify-between items-start"><div className="p-3 bg-white/10 rounded-2xl"><BrainCircuit className="w-6 h-6 text-white" /></div><span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-lg">本周 +12</span></div><div className="mt-6"><div className="text-4xl font-bold mb-1">1,248</div><p className="text-gray-400 text-sm">已收录知识点</p></div><div className="mt-6 space-y-3"><div className="flex justify-between text-xs text-gray-400"><span>同步进度</span><span>85%</span></div><div className="w-full bg-white/10 rounded-full h-2"><div className="bg-white h-2 rounded-full w-[85%]"></div></div></div></CardContent></Card>
            </motion.div>
          </div>
        </div>
        <div className="space-y-8">
          <motion.div variants={item}>
            <Card className="bg-white"><CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><CalendarIcon className="w-5 h-5" /> 日程安排</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">{['一', '二', '三', '四', '五', '六', '日'].map(d => <div key={d} className="text-muted-foreground text-xs py-1">{d}</div>)}{Array.from({ length: 30 }).map((_, i) => { const day = i + 1; const isToday = day === new Date().getDate(); return <div key={i} className={`aspect-square flex items-center justify-center rounded-full text-sm cursor-pointer hover:bg-gray-100 ${isToday ? 'bg-black text-white hover:bg-black' : ''}`}>{day}</div>; })}</div>
                <div className="space-y-4 mt-6">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">即将截止</h3>
                  {loading ? <Loader2 className="animate-spin" /> : urgentDeadlines.length > 0 ? (urgentDeadlines.map((item) => (<div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-orange-50 transition-colors group"><div className="w-2 h-2 mt-2 rounded-full bg-red-500"></div><div><p className="text-sm font-bold text-gray-900">{item.name}</p><p className="text-xs text-muted-foreground group-hover:text-orange-700">{item.courseName} • {formatDueDate(item.dueAt)}</p></div></div>))) : <div className="text-center py-4 text-xs text-muted-foreground">暂无紧急任务 🎉</div>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
             <Card className="bg-[#2a2a2a] text-white overflow-hidden"><CardContent className="p-6 relative"><h3 className="text-lg font-bold mb-2">专注模式</h3><p className="text-gray-400 text-sm mb-4">开启番茄钟，专注于当前的学习任务。</p><button className="w-full py-2 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">开始专注</button><div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div></CardContent></Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}